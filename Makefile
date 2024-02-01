MAKEFLAGS = --no-print-directory --always-make --silent
MAKE = make $(MAKEFLAGS)

dev:
	@echo "Booting up dev..."
	PORT=3010 npm run dev
