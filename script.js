document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements with error handling
  const elements = {
    sidebar: document.querySelector(".sidebar"),
    sidebarToggle: document.querySelector(".sidebar-toggle"),
    themeToggle: document.querySelector(".theme-toggle"),
    mobileMenuToggle: document.querySelector(".mobile-menu-toggle"),
    mainContent: document.querySelector(".main-content"),
    navItems: document.querySelectorAll(".nav-item"),
    contentSections: document.querySelectorAll(".content-section"),
    clockInBtn: document.getElementById("clock-in"),
    clockOutBtn: document.getElementById("clock-out"),
    statusIndicator: document.querySelector(".status-indicator"),
    currentStatus: document.getElementById("current-status"),
    timeTracked: document.getElementById("time-tracked"),
    currentDate: document.getElementById("current-date"),
    pendingTasks: document.getElementById("pending-tasks"),
    totalDocs: document.getElementById("total-docs"),
    leaveDays: document.getElementById("leave-days"),
    activityList: document.getElementById("activity-list"),
    notifications: document.querySelector(".notifications"),
  };

  // Check if critical elements exist
  if (
    !elements.sidebar ||
    !elements.activityList ||
    !elements.mainContent ||
    !elements.mobileMenuToggle
  ) {
    console.error("Critical DOM elements missing");
    return;
  }

  // State variables
  let state = {
    isClockedIn: localStorage.getItem("isClockedIn") === "true" || true,
    secondsWorked:
      parseInt(localStorage.getItem("secondsWorked")) ||
      8 * 3600 + 42 * 60 + 15,
    timerInterval: null,
    notifications: [
      { id: 1, text: "New task assigned", time: "10:30 AM", read: false },
      { id: 2, text: "Meeting scheduled", time: "Yesterday", read: false },
      { id: 3, text: "Document approved", time: "May 16", read: true },
    ],
  };

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Update current date display
  function updateCurrentDate() {
    if (!elements.currentDate) return;
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    elements.currentDate.textContent = new Date().toLocaleDateString(
      "en-US",
      options
    );
  }

  // Format time from seconds
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours
      .toString()
      .padStart(
        2,
        "0"
      )}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Update timer display
  function updateTimerDisplay() {
    if (!elements.timeTracked) return;
    elements.timeTracked.textContent = formatTime(state.secondsWorked);
  }

  // Start the timer
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.secondsWorked++;
      localStorage.setItem("secondsWorked", state.secondsWorked);
      updateTimerDisplay();
    }, 1000);
  }

  // Stop the timer
  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  // Update clock status UI
  function updateClockStatusUI() {
    if (!elements.currentStatus || !elements.statusIndicator) return;
    elements.currentStatus.textContent = state.isClockedIn
      ? "Clocked In"
      : "Clocked Out";
    elements.statusIndicator.classList.toggle("clocked-in", state.isClockedIn);
    if (elements.clockInBtn) elements.clockInBtn.disabled = state.isClockedIn;
    if (elements.clockOutBtn)
      elements.clockOutBtn.disabled = !state.isClockedIn;
  }

  // Clock in/out functionality
  function toggleClockStatus() {
    state.isClockedIn = !state.isClockedIn;
    localStorage.setItem("isClockedIn", state.isClockedIn);
    if (state.isClockedIn) {
      startTimer();
      addActivityLog(
        "Clocked in for the day",
        "fas fa-fingerprint",
        "clock-in"
      );
    } else {
      stopTimer();
      addActivityLog(
        "Clocked out for the day",
        "fas fa-sign-out-alt",
        "clock-out"
      );
    }
    updateClockStatusUI();
    addNotification(`User ${state.isClockedIn ? "clocked in" : "clocked out"}`);
  }

  // Add activity log
  function addActivityLog(text, iconClass, type) {
    if (!elements.activityList) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const activityTypes = {
      "clock-in": "completed",
      "clock-out": "uploaded",
      default: "chat",
    };
    const activityClass = activityTypes[type] || activityTypes["default"];
    const activityItem = document.createElement("li");
    activityItem.innerHTML = `
      <i class="fas ${iconClass} ${activityClass}"></i>
      <span>${text}</span>
      <small>${timeString}</small>
    `;
    elements.activityList.insertBefore(
      activityItem,
      elements.activityList.firstChild
    );
    if (elements.activityList.children.length > 10) {
      elements.activityList.removeChild(elements.activityList.lastChild);
    }
  }

  // Load sample data
  function loadSampleData() {
    if (elements.pendingTasks) elements.pendingTasks.textContent = "5";
    if (elements.totalDocs) elements.totalDocs.textContent = "12";
    if (elements.leaveDays) elements.leaveDays.textContent = "3";
    const sampleActivities = [
      {
        text: 'Completed task "Quarterly Report"',
        icon: "fa-check-circle",
        type: "completed",
        time: "10:45 AM",
      },
      {
        text: 'Uploaded "Project Proposal.pdf"',
        icon: "fa-upload",
        type: "uploaded",
        time: "Yesterday",
      },
      {
        text: "New message in #general",
        icon: "fa-comment",
        type: "chat",
        time: "Yesterday",
      },
      {
        text: "Approved leave request",
        icon: "fa-calendar-check",
        type: "completed",
        time: "May 16",
      },
    ];
    sampleActivities.forEach((activity) => {
      const activityItem = document.createElement("li");
      activityItem.innerHTML = `
        <i class="fas ${activity.icon} ${activity.type}"></i>
        <span>${activity.text}</span>
        <small>${activity.time}</small>
      `;
      elements.activityList.appendChild(activityItem);
    });
  }

  // Toggle sidebar collapse (desktop)
  function toggleSidebar(e) {
    if (!elements.sidebar || !elements.sidebarToggle) return;
    e.stopPropagation();
    elements.sidebar.classList.toggle("collapsed");
    const icon = elements.sidebarToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle(
        "fa-chevron-left",
        !elements.sidebar.classList.contains("collapsed")
      );
      icon.classList.toggle(
        "fa-chevron-right",
        elements.sidebar.classList.contains("collapsed")
      );
    }
  }





  
  // Toggle mobile menu
  function toggleMobileMenu(e) {
    if (!elements.sidebar) return;
    e.stopPropagation();
    elements.sidebar.classList.toggle("active");
    console.log(
      "Mobile menu toggled:",
      elements.sidebar.classList.contains("active")
    );
  }

  // Close mobile menu
  function closeMobileMenu() {
    if (elements.sidebar) {
      elements.sidebar.classList.remove("active");
      console.log("Mobile menu closed");
    }
  }

  // Toggle theme
  function toggleTheme() {
    if (!elements.themeToggle) return;
    document.body.classList.toggle("dark-mode");
    const icon = elements.themeToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle(
        "fa-moon",
        !document.body.classList.contains("dark-mode")
      );
      icon.classList.toggle(
        "fa-sun",
        document.body.classList.contains("dark-mode")
      );
    }
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  }

  // Switch content sections
  function switchSection(sectionId) {
    console.log("Switching to section:", sectionId);
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
      console.warn(`Section with ID ${sectionId} not found`);
      return;
    }
    elements.contentSections.forEach((section) => {
      section.classList.remove("active");
    });
    targetSection.classList.add("active");
    elements.navItems.forEach((item) => {
      item.classList.toggle(
        "active",
        item.getAttribute("data-section") === sectionId
      );
    });
    if (window.innerWidth <= 768) closeMobileMenu();
  }

  // Notification system
  function addNotification(text) {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    state.notifications.unshift({
      id: Date.now(),
      text,
      time: now,
      read: false,
    });
    if (state.notifications.length > 5) state.notifications.pop();
    updateNotificationBadge();
  }

  function updateNotificationBadge() {
    if (!elements.notifications) return;
    const unreadCount = state.notifications.filter((n) => !n.read).length;
    let badge = elements.notifications.querySelector(".badge");
    if (!badge && unreadCount > 0) {
      badge = document.createElement("span");
      badge.className = "badge";
      elements.notifications.appendChild(badge);
    }
    if (badge) badge.textContent = unreadCount || "";
  }

  // Handle window resize
  function handleResize() {
    if (window.innerWidth > 768 && elements.sidebar) {
      elements.sidebar.classList.remove("active", "collapsed");
    } else if (window.innerWidth <= 768 && elements.sidebar) {
      closeMobileMenu();
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    if (elements.sidebarToggle) {
      elements.sidebarToggle.addEventListener("click", toggleSidebar);
      elements.sidebarToggle.addEventListener("touchend", toggleSidebar);
    }
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener("click", toggleTheme);
    }
    if (elements.mobileMenuToggle) {
      elements.mobileMenuToggle.addEventListener("click", toggleMobileMenu);
      elements.mobileMenuToggle.addEventListener("touchend", toggleMobileMenu);
    }
    if (elements.clockInBtn)
      elements.clockInBtn.addEventListener("click", toggleClockStatus);
    if (elements.clockOutBtn)
      elements.clockOutBtn.addEventListener("click", toggleClockStatus);

    elements.navItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const sectionId = this.getAttribute("data-section");
        switchSection(sectionId);
      });

      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const sectionId = this.getAttribute("data-section");
          switchSection(sectionId);
        }
      });
    });

    if (elements.notifications) {
      elements.notifications.addEventListener("click", function (e) {
        e.preventDefault();
        const unreadNotifications = state.notifications.filter((n) => !n.read);
        if (unreadNotifications.length) {
          alert(
            `Notifications:\n${unreadNotifications
              .map((n) => `${n.time}: ${n.text}`)
              .join("\n")}`
          );
          state.notifications.forEach((n) => (n.read = true));
          updateNotificationBadge();
        } else {
          alert("No new notifications");
        }
      });
    }

    document.querySelectorAll(".quick-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const linkText = this.querySelector("span").textContent;
        addActivityLog(
          `Accessed ${linkText}`,
          this.querySelector("i").className,
          "default"
        );
        addNotification(`Clicked ${linkText} quick link`);
        alert(`Navigating to ${linkText}`);
      });
    });

    const closeSidebarOnOutsideClick = debounce(function (event) {
      if (
        window.innerWidth <= 768 &&
        elements.sidebar &&
        elements.mobileMenuToggle &&
        !elements.sidebar.contains(event.target) &&
        !elements.mobileMenuToggle.contains(event.target)
      ) {
        closeMobileMenu();
      }
    }, 100);

    document.addEventListener("click", closeSidebarOnOutsideClick);
    document.addEventListener("touchend", closeSidebarOnOutsideClick);

    elements.mainContent.addEventListener("click", function () {
      if (
        window.innerWidth <= 768 &&
        elements.sidebar.classList.contains("active")
      ) {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", debounce(handleResize, 100));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      if (elements.themeToggle) {
        const icon = elements.themeToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-moon");
          icon.classList.add("fa-sun");
        }
      }
    }
  }

  // Initialize the dashboard
  function initDashboard() {
    updateCurrentDate();
    updateTimerDisplay();
    if (state.isClockedIn) startTimer();
    updateClockStatusUI();
    loadSampleData();
    setupEventListeners();
    updateNotificationBadge();
    handleResize();
  }

  initDashboard();
});
