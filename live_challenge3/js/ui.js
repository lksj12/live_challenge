class UI {
    constructor() {
        this.profile = document.getElementById("profile");
        this.repos = document.getElementById("repos");
        this.grass = document.getElementById("grass");
}

    showProfile(user) {
        this.profile.innerHTML = `
            <div class="profile-card">
                <div class="profile-left">
                    <img src="${user.avatar_url}" alt="${user.login}" class="profile-img">
                    <a href="${user.html_url}" target="_blank" class="profile-link">
                        View Profile
                    </a>
                </div>

                <div class="profile-right">
                    <h2>${user.name || user.login}</h2>
                    <p>${user.bio || "소개 정보가 없습니다."}</p>

                    <div class="badges">
                        <span>Public Repos: ${user.public_repos}</span>
                        <span>Followers: ${user.followers}</span>
                        <span>Following: ${user.following}</span>
                    </div>

                    <ul class="info-list">
                        <li><strong>Company:</strong> ${user.company || "정보 없음"}</li>
                        <li><strong>Website:</strong> ${user.blog || "정보 없음"}</li>
                        <li><strong>Location:</strong> ${user.location || "정보 없음"}</li>
                        <li><strong>Member Since:</strong> ${this.formatDate(user.created_at)}</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showRepos(repos) {
        let output = "";

        repos.forEach(function(repo) {
            output += `
                <div class="repo-card">
                    <a href="${repo.html_url}" target="_blank" class="repo-name">
                        ${repo.name}
                    </a>

                    <div class="repo-stats">
                        <span>Stars: ${repo.stargazers_count}</span>
                        <span>Watchers: ${repo.watchers_count}</span>
                        <span>Forks: ${repo.forks_count}</span>
                    </div>
                </div>
            `;
        });

        this.repos.innerHTML = output;
    }

    showGrass(events) {
        const days = this.createRecentDays(30);
        const activityMap = this.createActivityMap(events);

        let output = `
            <div class="grass-card">
                <p class="grass-description">
                    최근 30일 기준 공개 GitHub 활동을 시각화한 잔디밭입니다.
                </p>
                <div class="grass-grid">
        `;

        days.forEach(function(day) {
            const count = activityMap[day.dateKey] || 0;
            const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : 3;

            output += `
                <div 
                    class="grass-cell level-${level}" 
                    title="${day.dateKey}: ${count} activities">
                </div>
            `;
        });

        output += `
                </div>
            </div>
        `;

        this.grass.innerHTML = output;
    }

    createRecentDays(count) {
        const days = [];

        for (let i = count - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dateKey = date.toISOString().split("T")[0];

            days.push({
                date: date,
                dateKey: dateKey
            });
        }

        return days;
    }

    createActivityMap(events) {
        const activityMap = {};

        events.forEach(function(event) {
            const dateKey = event.created_at.split("T")[0];

            if (!activityMap[dateKey]) {
                activityMap[dateKey] = 0;
            }

            activityMap[dateKey]++;
        });

        return activityMap;
    }

    clearProfile() {
        this.profile.innerHTML = "";
        this.repos.innerHTML = "";
        this.grass.innerHTML = "";
    }

    showSpinner() {
        this.profile.innerHTML = `
            <div class="spinner"></div>
        `;
        this.repos.innerHTML = "";
        this.grass.innerHTML = "";
    }

    hideSpinner() {
        const spinner = document.querySelector(".spinner");

        if (spinner) {
            spinner.remove();
        }
}

    showAlert(message) {
        this.clearAlert();
        const div = document.createElement("div");
        div.className = "alert";
        div.textContent = message;
        const searchCard = document.querySelector(".search-card");
        searchCard.before(div);
        setTimeout(() => {
            this.clearAlert();
        }, 3000);
    }

    clearAlert() {
        const currentAlert = document.querySelector(".alert");

        if (currentAlert) {
            currentAlert.remove();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);

        return date.toLocaleDateString("ko-KR");
    }
}