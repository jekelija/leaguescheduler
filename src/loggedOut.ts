//dynamically imported as entry point when not logged in
export async function init() {
    document.getElementById('main').classList.remove('hidden');
}