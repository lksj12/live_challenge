const github = new GitHub();
const ui = new UI();

const searchUser = document.getElementById("searchUser");

searchUser.addEventListener("keydown", async function(event) {
    if (event.key !== "Enter") {
        return;
    }

    const username = event.target.value.trim();

    if (username === "") {
        ui.showAlert("사용자명을 입력하세요.");
        ui.clearProfile();
        return;
    }

    try {
        ui.showSpinner();

        const data = await github.getUser(username);

        ui.hideSpinner();

        if (data.profile.message === "Not Found") {
            ui.showAlert("사용자를 찾을 수 없습니다.");
            ui.clearProfile();
            return;
        }

        ui.showProfile(data.profile);
        ui.showGrass(data.events);
        ui.showRepos(data.repos);
        
    } catch (error) {
        ui.hideSpinner();
        ui.showAlert("데이터를 불러오는 중 오류가 발생했습니다.");
        ui.clearProfile();

        console.error(error);
    }
});