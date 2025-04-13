
if (window.innerWidth < 768) {
	[].slice.call(document.querySelectorAll('[data-bss-disabled-mobile]')).forEach(function (elem) {
		elem.classList.remove('animated');
		elem.removeAttribute('data-bss-hover-animate');
		elem.removeAttribute('data-aos');
		elem.removeAttribute('data-bss-parallax-bg');
		elem.removeAttribute('data-bss-scroll-zoom');
	});
}

document.addEventListener('DOMContentLoaded', function() {
	if ('AOS' in window) {
		AOS.init();
	}

(function(){

	if (!('requestAnimationFrame' in window)) return;

	var backgrounds = [];
	var parallaxBackgrounds = document.querySelectorAll('[data-bss-parallax-bg]');

	for (var el of parallaxBackgrounds) {
		var bg = document.createElement('div');

		bg.style.backgroundImage = el.style.backgroundImage;
		bg.style.backgroundSize = 'cover';
		bg.style.backgroundPosition = 'center';
		bg.style.position = 'absolute';
		bg.style.height = '200%';
		bg.style.width = '100%';
		bg.style.top = 0;
		bg.style.left = 0;
		bg.style.zIndex = -100;

		el.appendChild(bg);
		backgrounds.push(bg);

		el.style.position = 'relative';
		el.style.background = 'transparent';
		el.style.overflow = 'hidden';
	}

	if (!backgrounds.length) return;

	var visible = [];
	var scheduled;

	window.addEventListener('scroll', scroll);
	window.addEventListener('resize', scroll);

	scroll();

	function scroll() {

		visible.length = 0;

		for(var i = 0; i < backgrounds.length; i++){
			var rect = backgrounds[i].parentNode.getBoundingClientRect();

			if (rect.bottom > 0 && rect.top < window.innerHeight) {
				visible.push({
					rect: rect,
					node: backgrounds[i]
				});
			}

		}

		cancelAnimationFrame(scheduled);

		if (visible.length) {
			scheduled = requestAnimationFrame(update);
		}

	}

	function update(){

		for(var i = 0; i < visible.length; i++){
			var rect = visible[i].rect;
			var node = visible[i].node;

			var quot = Math.max(rect.bottom, 0) / (window.innerHeight + rect.height);

			node.style.transform = 'translate3d(0, '+(-50*quot)+'%, 0)';
		}

	}

})();

let collections = document.querySelectorAll('[data-bss-type="blog-loop"]');

window.addEventListener("popstate", (e) => {
	for (let collection of collections) {
		updateCollection(collection);
	}
});

for (let collection of collections) {

	if (!canPaginateCollection(collection)) continue;

	updateCollection(collection);

	let pagination = collection.querySelector('[data-bss-type="blog-loop-pagination"]');

	pagination.addEventListener('click', function(e) {
		let paginationItem = e.target.closest('.page-item');
		if (!paginationItem) return;

		e.preventDefault();

		if (paginationItem.classList.contains('disabled') || paginationItem.classList.contains('active')) return;

		let collection = paginationItem.closest('[data-bss-type="blog-loop"]');
		if (!collection) return;

		let page = parseInt(paginationItem.dataset.page);
		if (!page) return;

		let pageParam = getPageParameter(collection);

		if (pageParam) {
			const url = new URL(window.location);
			url.searchParams.set(pageParam, page);
			history.pushState({ [pageParam]: page }, document.title, url);

			for (let c of collections) {
				let param = getPageParameter(c);
				if (param !== pageParam) continue;
				renderCollectionPage(c, page);
			}
		}
		else {
			renderCollectionPage(collection, page);
		}
	});
}

function canPaginateCollection(collection) {
	return !!collection.querySelector('[data-bss-type="blog-loop-pagination"]');
}

function getPageParameter(collection) {
	return collection.dataset.bssPageParam;
}

function updateCollection(collection) {
	if (!canPaginateCollection(collection)) return;

	const url = new URL(window.location.href);
	let pageParam = getPageParameter(collection);
	let page = (pageParam ? url.searchParams.get(pageParam) : 1) || 1;

	renderCollectionPage(collection, page);
}

function renderCollectionPage(collection, page = 1) {

	let pagination = collection.querySelector('[data-bss-type="blog-loop-pagination"]');
	if (!pagination) return;

	let perPage = collection.dataset.bssPerpage || 12;

	let listItems = [].slice.call(collection.querySelectorAll('[data-bss-type="blog-loop-item"]'));
	listItems.forEach(item => item.style.setProperty('display', 'none', 'important'));

	let visibleListItems = listItems.slice((page - 1) * perPage, page * perPage);
	visibleListItems.forEach(item => item.style.removeProperty('display'));

	let paginationItems = [].slice.call(pagination.querySelectorAll('.page-item'));

	let itemCount = listItems.length;
	let pageCount = Math.ceil(itemCount / perPage);

	let previousBtnDisabled = page - 1 <= 0;
	let previousPage = previousBtnDisabled ? 1 : page - 1;

	let nextBtnDisabled = page + 1 > pageCount;
	let nextPage = nextBtnDisabled ? pageCount : page + 1;

	for (let i = 0; i < paginationItems.length; i++) {
		let paginationItem = paginationItems[i];

		paginationItem.classList.remove('active', 'disabled');

		if (paginationItem.dataset.type === 'prev') {
			paginationItem.dataset.page = previousPage;

			if (previousBtnDisabled) {
				paginationItem.classList.add('disabled');
			}
		}
		else if (paginationItem.dataset.type === 'next') {
			paginationItem.dataset.page = nextPage;

			if (nextBtnDisabled) {
				paginationItem.classList.add('disabled');
			}
		}
		else {
			if (paginationItem.dataset.page == page) {
				paginationItem.classList.add('active');
			}
		}
	}
}
}, false);