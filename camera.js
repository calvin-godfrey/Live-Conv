var canvas, context, vid, photo, table;

var promise = window.navigator.mediaDevices.getUserMedia({video: true}).then(function(stream){
    document.getElementById("increase").addEventListener("mousedown", function(event){
        var table = document.getElementById("kernel");
        var box = document.createTextNode("<input type='number' min='-100' max='100' step='0.01'/>");
        var rows = table.childNodes;
        for(var i=0;i<rows.length;i++){
            var row = rows[i];
            var newItem = document.createElement("TD");
            newItem.appendChild(box);
            row.insertBefore(newItem, row.childNodes[0]);
            row.appendChild(newItem);
        }
    });
    vid = document.getElementById("camera");
    photo = document.getElementById("mod");
    canvas = document.getElementById("canvas");
    canvas.width = 640;
    canvas.height = 480;
    context = canvas.getContext("2d");
    vid.srcObject = stream;
    vid.onloadedmetadata = function(e){
        vid.play();
        var loop = setInterval(updateCanvas, 100);
    }
});

function updateCanvas(){
    context.drawImage(vid, 0, 0, 640, 480);
    table = document.getElementById("kernel");
    var kernel = [[]];
    for(var i=0,row;row=table.rows[i];i++){
        for(var j=0,col;col=row.cells[j];j++){
            if(!(col.childNodes[0].value)){
                kernel[i].push(0);
            } else {
                kernel[i].push(parseFloat(col.childNodes[0].value));
            }
        }
        kernel.push([]);
    }
    kernel.splice(kernel.length-1, 1);
    var pixels = context.getImageData(0, 0, 640, 480);
    var newPixels = convolution(kernel, pixels);
    context.putImageData(newPixels, 0, 0);
    var data = canvas.toDataURL("image/png");
    photo.setAttribute('src', data);
}

function convolution(kernel, pixels){
    var useScale = document.getElementById("scale").checked;
    var ansPixels = context.createImageData(pixels);
    pixels = pixels.data;
    if(kernel.length!=kernel[0].length){
        console.log("Not a square matrix");
        return;
    }
    var n = kernel.length;
    if(n%2!=1){
        console.log("Not an odd sized kernel");
        return;
    }
    var border = (n-1)/2;
    var scale = 0.0;
    for(var i=0;i<n;i++){
        for(var j=0;j<n;j++){
            scale += kernel[i][j];
        }
    }
    console.log("------------"+scale+"--------------");
    for(var index=4*border;index<pixels.length-(4*border);index+=4){
        var sumRed = 0;
        var sumGreen = 0;
        var sumBlue = 0;
        for(var i=0;i<n;i++){
            for(var j=0;j<n;j++){
                sumRed += pixels[index-(4*border)+(i*4*n)+(j*4)]*kernel[i][j];
                sumGreen += pixels[index+1-(4*border)+(i*4*n)+(j*4)]*kernel[i][j];
                sumBlue += pixels[index+2-(4*border)+(i*4*n)+(j*4)]*kernel[i][j];
            }
        }
        if(useScale){
            sumRed /= scale;
            sumGreen /= scale;
            sumBlue /= scale;
        }
        sumRed = sumRed<0?0:sumRed>255?255:sumRed;
        sumGreen = sumGreen<0?0:sumGreen>255?255:sumGreen;
        sumBlue = sumBlue<0?0:sumBlue>255?255:sumBlue;

        ansPixels.data[index] = Math.floor(sumRed);
        ansPixels.data[index+1] = Math.floor(sumGreen);
        ansPixels.data[index+2] = Math.floor(sumBlue);
        ansPixels.data[index+3] = 255; //Alpha
    }
    return ansPixels;
}
