export async function logs(options) {
    spawn(`docker compose logs ${options.follow ? '-f' : ''}`, {cwd: join(Config.DOCKER_COMPOSE_FILE, ".."), stdio: "inherit"});
}