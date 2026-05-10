document.getElementById('generate').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    const textInput = document.getElementById('blinkyText').value;
    const status = document.getElementById('status');

    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please upload an image first!');
        return;
    }

    status.innerText = "Generating GIF...";

    const imgUrl = URL.createObjectURL(fileInput.files[0]);
    const img = new Image();
    img.src = imgUrl;

    img.onload = async () => {
        // Updated to a square size
        const width = 99;
        const height = 99;

        const workerStr = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js').then(r => r.text());
        const blob = new Blob([workerStr], {type: 'application/javascript'});
        
        const gif = new GIF({
            workers: 2,
            quality: 1,
            width: width,
            height: height,
            workerScript: URL.createObjectURL(blob),
            transparent: '0xff00ff'
        });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        ctx.imageSmoothingEnabled = false;

        const drawFrame = (showText, shineOffset) => {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(1, 1, width - 2, height - 2);

            const innerW = width - 4;
            const innerH = height - 4;
            const scale = Math.max(innerW / img.width, innerH / img.height);
            const drawW = img.width * scale;
            const drawH = img.height * scale;
            const drawX = 2 + (innerW / 2) - (drawW / 2);
            const drawY = 2 + (innerH / 2) - (drawH / 2);
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(2, 2, innerW, innerH);
            ctx.clip(); 
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.restore();

            ctx.fillStyle = '#ff00ff';
            const holeSize = 3;
            const spacing = 10;
            
            for (let x = 3; x < width; x += spacing) {
                ctx.fillRect(x, 0, holeSize, holeSize);
                ctx.fillRect(x, height - holeSize, holeSize, holeSize);
            }
            for (let y = 3; y < height; y += spacing) {
                ctx.fillRect(0, y, holeSize, holeSize);
                ctx.fillRect(width - holeSize, y, holeSize, holeSize);
            }

            // Adjusted shine angle for a square
            if (shineOffset !== null) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.moveTo(shineOffset, 2);
                ctx.lineTo(shineOffset + 20, 2);
                ctx.lineTo(shineOffset - 40, height - 2);
                ctx.lineTo(shineOffset - 60, height - 2);
                ctx.fill();
            }

            if (showText && textInput) {
                ctx.font = '16px "VT323", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const txtX = width / 2;
                const txtY = height / 2 + 2;

                ctx.fillStyle = 'black';
                ctx.fillText(textInput, txtX + 1, txtY + 1);
                ctx.fillText(textInput, txtX - 1, txtY - 1);
                ctx.fillText(textInput, txtX + 1, txtY - 1);
                ctx.fillText(textInput, txtX - 1, txtY + 1);
                
                ctx.fillStyle = 'white';
                ctx.fillText(textInput, txtX, txtY);
            }
        };

        // Render animation sequence - adjusted offsets to sweep across the wider diagonal
        drawFrame(true, null);
        gif.addFrame(ctx, {copy: true, delay: 600});

        drawFrame(false, 30);
        gif.addFrame(ctx, {copy: true, delay: 80});

        drawFrame(false, 70);
        gif.addFrame(ctx, {copy: true, delay: 80});

        drawFrame(false, 110);
        gif.addFrame(ctx, {copy: true, delay: 80});

        drawFrame(false, 150);
        gif.addFrame(ctx, {copy: true, delay: 80});

        drawFrame(true, null);
        gif.addFrame(ctx, {copy: true, delay: 600});

        drawFrame(false, null);
        gif.addFrame(ctx, {copy: true, delay: 400});

        gif.on('finished', function(blob) {
            status.innerText = "Done!";
            const resultImg = document.getElementById('result');
            resultImg.src = URL.createObjectURL(blob);
            
            const dlLink = document.getElementById('download');
            dlLink.href = resultImg.src;
            dlLink.download = 'my-square-stamp.gif';
            dlLink.style.display = 'block';
        });

        gif.render();
    };
});
