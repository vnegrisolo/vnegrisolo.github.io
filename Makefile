#!make
.PHONY: help outdated update setup server

help: # Shows this help.
	@grep ": \#" ${MAKEFILE_LIST} | column -t -s ':' | sort

outdated: # Shows outdated packages.
	bundle outdated

update: # Update dependencies.
	bundle update

setup: # Setup the App.
	gem install bundler
	bundle install
	./bin/setup

server: # Run Server
	sleep 3 && open http://localhost:4000 &
	bundle exec jekyll server --drafts
