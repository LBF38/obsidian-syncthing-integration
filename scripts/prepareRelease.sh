#!/bin/bash

if ! git log -1 --pretty=%B | grep -q "chore(release): :bookmark: $1"; then
	pnpm run version
	git add manifest.json versions.json package.json docs/CHANGELOG.md
	git checkout -b release/"$1"
	git commit -m "chore(release): :bookmark: $1 [skip ci]\n\n$2"
	git push --set-upstream origin release/"$1" --force
	if gh pr list | grep -q "release/$1"; then
		echo "a release PR already exists"
		pr_number=$(gh pr list --state open | grep "release/$1" | awk '{print $1}')
		gh pr edit "$pr_number" --title "chore(release): :bookmark: $1" --body "$2"
	else
		echo "creating the release PR"
		gh pr create --title "chore(release): :bookmark: $1" --body "$2" --base master --head release/"$1"
	fi
	git checkout master
	echo "Need to merge the release PR"
	exit 1
fi

echo "creating and publishing the release $1 to GitHub"
