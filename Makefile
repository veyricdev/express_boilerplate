dev:
	docker compose up
dev-d:
	docker compose up -d

bash:
	docker exec -it express_boilerplate_api sh

logs:
	docker compose logs app_api -f

down:
	docker compose down

rm:
	docker compose rm
