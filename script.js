// ---------- 1. Load each section file into index.html ----------
var sections = ["home", "about", "skills", "projects", "certifications", "contact"];

var loaded = sections.map(function (name) {
  return fetch("sections/" + name + ".html")
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      document.getElementById(name).innerHTML = html;
    });
});

// Start the effects once every section is on the page
Promise.all(loaded).then(function () {
  startTyping();
  addRevealEffect();
  updateActiveLink();
});

// ---------- 2. Typing effect for the hero job title ----------
function startTyping() {
  var el = document.querySelector(".hero-text h2");
  if (!el) return;

  var roles = ["Full-Stack Developer", "Data Analyst", "Problem Solver"];
  var roleIndex = 0;
  var charIndex = 0;
  var deleting = false;

  el.textContent = "";
  el.classList.add("typing");

  function type() {
    var word = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = word.substring(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(type, 1500);
        return;
      }
    } else {
      charIndex--;
      el.textContent = word.substring(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(type, deleting ? 50 : 100);
  }

  type();
}

// ---------- 3. Fade-up animation when sections scroll into view ----------
function addRevealEffect() {
  var selector =
    ".section-tag, .section-title, .about-text, .stat, .skill-card, " +
    ".project-card, .cert-card, .contact-info, .contact-form, .view-all-wrap";
  var items = document.querySelectorAll(selector);

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var index = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.animationDelay = (index % 3) * 0.15 + "s";
        el.classList.add("in-view");

        // When the animation ends, clean up so hover effects work normally
        el.addEventListener(
          "animationend",
          function () {
            el.classList.remove("reveal", "in-view");
            el.style.animationDelay = "";
          },
          { once: true }
        );

        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(function (el) {
    if (el.closest(".hero")) return; // hero has its own animation
    if (el.className.indexOf("hidden-") !== -1) return; // hidden cards use pop-in
    el.classList.add("reveal");
    observer.observe(el);
  });
}

// ---------- 4. View All / Show Less buttons ----------
function toggleMore(hiddenClass, button, moreText, lessText) {
  var opened = button.getAttribute("data-open") === "yes";
  var items = document.querySelectorAll("." + hiddenClass);

  items.forEach(function (item) {
    if (opened) {
      item.classList.remove("revealed");
    } else {
      item.classList.add("revealed");
    }
  });

  if (opened) {
    button.textContent = moreText;
    button.setAttribute("data-open", "no");
    button.closest("section").scrollIntoView({ behavior: "smooth" });
  } else {
    button.textContent = lessText;
    button.setAttribute("data-open", "yes");
  }
}

document.addEventListener("click", function (e) {
  var id = e.target.id;

  if (id === "viewAllSkills") {
    toggleMore("hidden-skill", e.target, "View All Skills", "Show Less");
  }
  if (id === "viewAllProjects") {
    toggleMore("hidden-project", e.target, "View All Projects", "Show Less");
  }
  if (id === "viewAllCerts") {
    toggleMore("hidden-cert", e.target, "View All Certifications", "Show Less");
  }
  if (id === "scrollTopBtn") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ---------- 5. Progress bar, scroll-to-top button, active nav link ----------
function updateActiveLink() {
  var current = "home";

  sections.forEach(function (name) {
    var sec = document.getElementById(name);
    if (sec && sec.getBoundingClientRect().top <= 120) {
      current = name;
    }
  });

  // At the very bottom of the page, highlight Contact
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
    current = "contact";
  }

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}

window.addEventListener("scroll", function () {
  var scrollTop = window.scrollY;
  var height = document.documentElement.scrollHeight - window.innerHeight;

  document.getElementById("progressBar").style.width = (scrollTop / height) * 100 + "%";

  var topBtn = document.getElementById("scrollTopBtn");
  if (scrollTop > 300) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }

  updateActiveLink();
});

// ---------- 6. Contact form: sends the message to my email ----------
document.addEventListener("submit", function (e) {
  if (e.target.id !== "contactForm") return;
  e.preventDefault();

  var form = e.target;
  var status = document.getElementById("formStatus");

  // Until Formspree is set up, open the visitor's email app instead
  if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
    var name = form.elements["name"].value;
    var email = form.elements["email"].value;
    var subject = form.elements["subject"].value || "Portfolio Contact";
    var message = form.elements["message"].value;
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;

    window.location.href =
      "mailto:sreevallitelugu2006@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    return;
  }

  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" }
  })
    .then(function (response) {
      if (response.ok) {
        status.textContent = "Message sent! I will get back to you soon.";
        form.reset();
      } else {
        status.textContent = "Something went wrong. Please email me directly.";
      }
    })
    .catch(function () {
      status.textContent = "Something went wrong. Please email me directly.";
    });
});