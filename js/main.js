// const url = '../docs/pdf.pf';
const url = '../docs/pdf.pdf';
const gotoPageNum = document.getElementById('goto-page-num');
const currentScale = document.getElementById('current-scale');
const scaleIncrBtn = document.getElementById('scale-incr');
const scaleDecrBtn = document.getElementById('scale-decr');

pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.0;

const canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page 
const renderPage = num => {
    pageIsRendering = true;
    
    pdfDoc.getPage(num).then(page=>{
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderCtx = {
            canvasContext: ctx,
            viewport
        }
        page.render(renderCtx).promise.then(()=>{
            pageIsRendering = false;
            if (pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
    })
    // Output current page 
    document.querySelector('#page-num').textContent  = num
}

// Check for pages rendering 
const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

//Show Prev Page
const showPrevPage = () => {
    if(pageNum<=1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.querySelector('#prev-page').addEventListener('click', showPrevPage);

//Show Next Page
const showNextPage = () => {
    if(pageNum>=pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.querySelector('#next-page').addEventListener('click', showNextPage);

// Get the Dcoument 
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_){
    pdfDoc = pdfDoc_;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    gotoPageNum.min = 1;
    gotoPageNum.max = pdfDoc.numPages;
    currentScale.textContent = 100;
    renderPage(pageNum);
}).catch(err=>{
    //display error
    const div = document.createElement('div');
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // remove top-bar
    document.querySelector('.top-bar').style.display = 'none';
})
const goto = (e)=>{
    e.preventDefault();
    if(gotoPageNum){
        pageNum = +(gotoPageNum.value);
        renderPage(pageNum)
    }
    return false;
}

scaleIncrBtn.addEventListener('click', ()=>{
    if(scale<=1.95){
        scale = scale + 0.05;
        renderPage(pageNum)
        currentScale.textContent = parseInt(scale*100);
    }
})
scaleDecrBtn.addEventListener('click', ()=>{
    if(scale*100<50){
        return;
    }
    scale = scale - 0.05;
    renderPage(pageNum)
    currentScale.textContent = parseInt(scale*100);
})