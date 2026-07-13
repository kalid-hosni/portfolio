$(function () {

    // Header Scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 60) {
            $("header").addClass("fixed-header");
        } else {
            $("header").removeClass("fixed-header");
        }
    });


    // Featured Owl Carousel
    $('.featured-projects-slider .owl-carousel').owlCarousel({
        center: true,
        loop: true,
        margin: 30,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 3
            },
            1200: {
                items: 4
            }
        }
    })


    // Count - trigger when each stat scrolls into view (matches its AOS reveal),
    // not immediately on page load while it's still hidden
    document.addEventListener('aos:in', function (e) {
        const target = e.detail;
        if (!target) return;
        const counters = target.matches && target.matches('.count')
            ? [target]
            : (target.querySelectorAll ? target.querySelectorAll('.count') : []);
        counters.forEach(function (el) {
            const $el = $(el);
            if ($el.data('counted')) return;
            $el.data('counted', true);
            const target_val = parseInt($el.attr('data-target') || $el.text(), 10);
            $el.prop('Counter', 0).animate({
                Counter: target_val
            }, {
                duration: 1000,
                easing: 'swing',
                step: function (now) {
                    $el.text(Math.ceil(now));
                }
            });
        });
    });


    // ScrollToTop
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const btn = document.getElementById("scrollToTopBtn");
    btn.addEventListener("click", scrollToTop);

    window.onscroll = function () {
        const btn = document.getElementById("scrollToTopBtn");
        if (document.documentElement.scrollTop > 100 || document.body.scrollTop > 100) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    };


    // Aos
	AOS.init({
		once: true,
	});

});


// Auto-update footer copyright year
document.addEventListener("DOMContentLoaded", function () {
	const yearEl = document.getElementById("copyright-year");
	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}
});

// Email anti-spam: assemble mailto links from split parts at runtime so the address
// never appears as plain text in the page source (defeats basic scraper bots that
// only parse static HTML for "mailto:" links or "@" patterns).
document.addEventListener("DOMContentLoaded", function () {
	document.querySelectorAll("[data-email-user]").forEach(function (el) {
		const user = el.getAttribute("data-email-user");
		const domain = el.getAttribute("data-email-domain");
		if (!user || !domain) return;
		const email = user + "@" + domain;
		el.setAttribute("href", "mailto:" + email);
		const textEl = el.querySelector("[data-email-text]");
		if (textEl) {
			textEl.textContent = email;
		}
	});
});

// Contact form: client-side validation (including proper email format checking) plus
// AJAX submission so the page doesn't navigate away, with visible success/error feedback.
document.addEventListener("DOMContentLoaded", function () {
	const form = document.getElementById("contact-form");
	if (!form) return;

	const submitBtn = document.getElementById("contact-form-submit");
	const successEl = document.getElementById("contact-form-success");
	const errorEl = document.getElementById("contact-form-error");

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		event.stopPropagation();

		// Hide any previous status messages
		successEl.style.display = "none";
		errorEl.style.display = "none";

		// Native + Bootstrap-style validation (checks required fields and email format)
		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			return;
		}
		form.classList.add("was-validated");

		// Honeypot check: if the hidden botcheck field is filled in, silently stop (likely a bot)
		const botcheck = form.querySelector('[name="botcheck"]');
		if (botcheck && botcheck.checked) {
			return;
		}

		submitBtn.disabled = true;

		const formData = new FormData(form);
		fetch(form.action, {
			method: "POST",
			body: formData,
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.then((data) => {
				submitBtn.disabled = false;
				if (data.success) {
					form.reset();
					form.classList.remove("was-validated");
					successEl.style.display = "block";
				} else {
					errorEl.style.display = "block";
				}
			})
			.catch(() => {
				submitBtn.disabled = false;
				errorEl.style.display = "block";
			});
	});
});

// Basic content protection: deter casual right-click saving, image dragging, and copying.
// Note: this is a deterrent, not a security measure — anyone using browser dev tools,
// view-source, or a screenshot can still access the underlying content. It simply
// removes the easy, casual ways most people try to save or copy things.
(function () {
	// Disable right-click context menu site-wide (blocks "Save image as", "Copy", etc. from the menu)
	document.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	});

	// Disable dragging images out of the page
	document.addEventListener("dragstart", function (e) {
		if (e.target.tagName === "IMG") {
			e.preventDefault();
		}
	});

	// Disable copying selected content, except inside form fields (so people can still
	// copy/paste text they've typed into the contact form)
	document.addEventListener("copy", function (e) {
		const tag = e.target.tagName;
		if (tag !== "INPUT" && tag !== "TEXTAREA") {
			e.preventDefault();
		}
	});
})();

// Case-study image lightbox: click any case-study image to preview it larger,
// with next/previous navigation cycling through images in the same gallery group.
document.addEventListener("DOMContentLoaded", function () {
	const overlay = document.getElementById("lightbox-overlay");
	if (!overlay) return;

	const lightboxImg = document.getElementById("lightbox-img");
	const lightboxCaption = document.getElementById("lightbox-caption");
	const closeBtn = overlay.querySelector(".lightbox-close");
	const prevBtn = overlay.querySelector(".lightbox-prev");
	const nextBtn = overlay.querySelector(".lightbox-next");

	let currentGroup = [];
	let currentIndex = 0;

	function openLightbox(group, index) {
		currentGroup = Array.from(document.querySelectorAll('[data-lightbox-group="' + group + '"]'));
		currentIndex = index;
		showImage();
		overlay.classList.add("is-open");
	}

	function showImage() {
		const el = currentGroup[currentIndex];
		if (!el) return;
		lightboxImg.src = el.getAttribute("data-lightbox-src");
		lightboxImg.alt = el.getAttribute("data-lightbox-alt") || "";
		lightboxCaption.textContent = el.getAttribute("data-lightbox-caption") || "";
	}

	function closeLightbox() {
		overlay.classList.remove("is-open");
		lightboxImg.src = "";
	}

	document.querySelectorAll(".case-study-img-wrap").forEach(function (el, i) {
		el.addEventListener("click", function () {
			const group = el.getAttribute("data-lightbox-group");
			if (!group) return; // no image wired up yet (placeholder)
			const groupEls = Array.from(document.querySelectorAll('[data-lightbox-group="' + group + '"]'));
			const index = groupEls.indexOf(el);
			openLightbox(group, index);
		});
	});

	closeBtn.addEventListener("click", closeLightbox);
	overlay.addEventListener("click", function (e) {
		if (e.target === overlay) closeLightbox();
	});
	prevBtn.addEventListener("click", function () {
		currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
		showImage();
	});
	nextBtn.addEventListener("click", function () {
		currentIndex = (currentIndex + 1) % currentGroup.length;
		showImage();
	});
	document.addEventListener("keydown", function (e) {
		if (!overlay.classList.contains("is-open")) return;
		if (e.key === "Escape") closeLightbox();
		if (e.key === "ArrowLeft") prevBtn.click();
		if (e.key === "ArrowRight") nextBtn.click();
	});
});

// Page preloader: fade out once the page (including images) has fully loaded
(function () {
	var preloader = document.getElementById("page-preloader");
	if (!preloader) return;
	var hidden = false;
	function hidePreloader() {
		if (hidden) return;
		hidden = true;
		preloader.classList.add("is-hidden");
		setTimeout(function () {
			preloader.style.display = "none";
		}, 400);
	}
	window.addEventListener("load", hidePreloader);
	// Safety net in case the load event is delayed by a slow third-party resource
	setTimeout(hidePreloader, 4000);
})();
