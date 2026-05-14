class GitHub {
    constructor() {
        this.reposCount = 5;
        this.reposSort = "created";
    }

    async getUser(username) {
        const profileResponse = await fetch(`https://api.github.com/users/${username}`);
        const reposResponse = await fetch(
            `https://api.github.com/users/${username}/repos?sort=${this.reposSort}&per_page=${this.reposCount}`
        );
        const eventsResponse = await fetch(
            `https://api.github.com/users/${username}/events/public`
        );

        const profile = await profileResponse.json();
        const repos = await reposResponse.json();
        const events = await eventsResponse.json();

        return {
            profile: profile,
            repos: repos,
            events: events
        };
    }
}