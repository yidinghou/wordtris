document.querySelectorAll('.cartoon-cat').forEach(cat => {
    cat.addEventListener('click', function() {
        cat.classList.remove('jump');
        void cat.offsetWidth;
        cat.classList.add('jump');
    });
});