# 贡献者指南

## 我想成为代码贡献者！
We welcome pull requests from Free Code Camp campers (our students) and seasoned JavaScript developers alike! Follow these steps to contribute:

我们欢迎每一位 FreeCodeCamp学员 和 有经验的JavaScript开发人员向我们提交PR！请参照下面这些步骤参与进来：


1.  Find an issue that needs assistance by searching for the [Help Wanted](https://github.com/FreeCodeCampChina/freecodecamp.cn/labels/help%20wanted) tag.

   通过搜索标记[Help Wanted](https://github.com/FreeCodeCampChina/freecodecamp.cn/labels/help%20wanted) 来找到需要帮助的问题。

2.  Let us know you are working on it, by posting a comment on the issue.

   在问题下面发送一个评论，便于让我们知道你正在着手解决这个问题。

3.  Feel free to ask for help in our [Help Contributors](https://gitter.im/FreeCodeCamp/chinese) Gitter room.

   你可以自由地在我们的[Help Contributors](https://gitter.im/FreeCodeCamp/chinese)聊天室提问来获得帮助。

If you've found a bug that is not on the board, [follow these steps](#found-a-bug).

## Contribution Guidelines

1.  Fork the project: [How To Fork And Maintain a Local Instance of Free Code Camp](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/How-To-Fork-And-Maintain-a-Local-Instance-of-Free-Code-Camp)
2.  Create a branch specific to the issue or feature you are working on. Push your work to that branch. ([Need help with branching?](https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches))
3.  Name the branch something like `fix/xxx` or `feature/xxx` where `xxx` is a short description of the changes or feature you are attempting to add. For example `fix/email-login` would be a branch where I fix something specific to email login.
4. [Set up Linting](#linting-setup) to run as you make changes.
5. When you are ready to share your code, run the test suite `npm test` and ensure all tests pass.  For Windows contributors, skip the jsonlint pretest run by using `npm run test-challenges`, as jsonlint will always fail on Windows, given the wildcard parameters.
5.  Squash your Commits. Ref: [rebasing](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/git-rebase)
6.  Submit a [pull request](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Pull-Request-Contribute) from your branch to Free Code Camp's `staging` branch.  [Travis CI](https://travis-ci.org/FreeCodeCamp/FreeCodeCamp) will then take your code and run `npm test`.  Make sure this passes, then we'll do a quick code review and give you feedback, then iterate from there.


Prerequisites
-------------

- [MongoDB](http://www.mongodb.org/downloads)
- [Node.js](http://nodejs.org)

Getting Started
---------------
Note: If this is your first time working with a node-gyp dependent module, please follow the [node-gyp installation guide](https://github.com/nodejs/node-gyp#installation) to ensure a working npm build.

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/freecodecampchina/freecodecamp.cn.git freecodecamp

# Change directory
cd freecodecamp

# Install NPM dependencies
npm install

# Install Gulp globally
npm install -g gulp

# Install Bower globally
npm install -g bower

# Install Bower dependencies
bower install
```
*Private Environment Variables (API Keys)*
```bash
# Create a copy of the "sample.env" and name it as ".env".
# Populate it with the necessary API keys and secrets:
cp sample.env .env
```

Edit your `.env` file and modify the API keys only for services that you will use.

Note : Not all keys are required, to run the app locally, however `MONGOHQ_URL` is the most important one.

If you only use email login, in addition to `MONGOHQ_URL`, `SESSION_SECRET`, add the  `MANDRILL_USER` and `MANDRILL_PASSWORD` API Keys. Not setting these keys will throw an exception when you sign up which you can ignore, you will still be able to login, however you may get these keys [here](https://www.mandrill.com/signup/). Sign up and create a new pair of keys.

You can leave the other keys as they are. Keep in mind if you want to use more services you'll have to get your own API keys for those services and edit those entries accordingly in the `.env` file.

```bash
# Start the mongo server in a separate terminal
mongod

# Initialize Free Code Camp
# This will seed the database for the first time.
# This command should only be run once.
npm run only-once

# start the application
gulp
```
Now navigate to your browser and open http://localhost:3001
If the app loads, congratulations - you're all set. Otherwise, let us know by opening a GitHub issue and with your error.

## Linting Setup
You should have [ESLint running in your editor](http://eslint.org/docs/user-guide/integrations.html), and it will highlight anything doesn't conform to [Free Code Camp's JavaScript Style Guide](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Free-Code-Camp-JavaScript-Style-Guide) (you can find a summary of those rules [here](https://github.com/FreeCodeCamp/FreeCodeCamp/blob/staging/.eslintrc). Please do not ignore any linting errors, as they are meant to **help** you and to ensure a clean and simple code base. Make sure none of your JavaScript is longer than 80 characters per line.  The reason we enforce this is because one of our dependent NPM modules, [jsonlint](https://github.com/zaach/jsonlint), does not fully support wildcard paths in Windows.

## Found a bug?
Do not file an issue until you have followed these steps:

1. Read [Help I've Found a Bug](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Help-I've-Found-a-Bug) wiki page and follow the instructions there.
2. Asked for confirmation in the appropriate [Help Room](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Help-Rooms)
3. Please *do not* open an issue without a 3rd party confirmation of your problem.


## Creating Pull Requests
**What is a Pull Request?**

A pull request (PR) is a method of submitting proposed changes to the Free Code Camp Repo (or any Repo, for that matter). You will make changes to copies of the files which make up Free Code Camp in a personal fork, then apply to have them accepted by Free Code Camp proper.

**Need Help?**

Free Code Camp Issue Mods and staff are on hand to assist with Pull Request related issues on our Help Contributors Chat Room

**Methods**

There are two methods of creating a Pull for Free Code Camp:

- Editing files via the GitHub Interface
- Editing files on a local clone  

**Important: ALWAYS EDIT ON A BRANCH**  
Take away only one thing from this document, it should be this: Never, **EVER** make edits to the `staging` branch. ALWAYS make a new branch BEFORE you edit files. This is critical, because if your PR is not accepted, your copy of staging will be forever sullied and the only way to fix it is to delete your fork and re-fork.

_**Method 1: Editing via your Local Fork (Recommended)**_  
This is the recommended method. Read about How to Setup and Maintain a Local Instance of Free Code Camp.

1. Perform the maintenance step of rebasing `staging`.  
2. Ensure you are on the `staging` branch using `git status`:

```bash
$ git status
On branch staging
Your branch is up-to-date with 'origin/staging'.

nothing to commit, working directory clean
```

3. If you are not on staging or your working directory is not clean, resolve any outstanding files/commits and checkout staging `git checkout staging`
4. Create a branch off of `staging` with git: `git checkout -B branch/name-here`  
**Note:** Branch naming is important. Use a name like `fix/short-fix-description` or `feature/short-feature-description`. Review the [Contribution Guidelines](#contribution-guidelines) for more detail.
5. Edit your file(s) locally with the editor of your choice
6. Check your `git status` to see unstaged files.
7. Add your edited files: `git add path/to/filename.ext` You can also do: `git add .` to add all unstaged files. Take care, though, because you can accidentally add files you don't want added. Review your `git status` first.
8. Commit your edits: `git commit -m "Brief Description of Commit"`
9. Squash your commits, if there are more than one.
10. Push your commits to your GitHub Fork: `git push -u origin branch/name-here`
11. Go to [Common Steps](#common-steps)

_**Method 2: Editing via the GitHub Interface**_  

Note: Editing via the GitHub Interface is not recommended, since it is not possible to update your fork via GitHub's interface without deleting and recreating your fork.  

Read the [Wiki article](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/How-To-Create-A-Pull-Request-for-Free-Code-Camp#editing-via-the-github-interface) for further information

## Common Steps
1. Once the edits have been committed, you will be prompted to create a pull request on your fork's Github Page.
2. By default, all pull requests should be against the FCC main repo, `staging` branch.
3. Submit a [pull request](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Pull-Request-Contribute) from your branch to Free Code Camp's `staging` branch.
3. The title (also called the subject) of your PR should be descriptive of your changes and succinctly indicates what is being fixed.  
   - **Do not add the issue number in the PR title**.
   - Examples: `Add Test Cases to Bonfire Drop It` `Correct typo in Waypoint Size Your Images`
4. In the body of your PR include a more detailed summary of the changes you made and why.
   - If the PR is meant to fix an existing bug/issue, then, at the end of your PR's commit message, append the keyword `closes` and #xxxx (where xxxx is the issue number). Example: `closes #1337`.  
   This tells GitHub to close the existing issue, if the PR is merged.
5. Indicate if you have tested on a local copy of the site or not.

## Next Steps

**If your PR is accepted**

Once your PR is accepted, you may delete the branch you created to submit it. This keeps your working fork clean.  

You can do this with a press of a button on the GitHub PR interface. You can delete the local copy of the branch with: `git branch -D branch/to-delete-name`

**If your PR is rejected**

Don't despair! You should receive solid feedback from the Issue Moderators as to why it was rejected and what changes are needed.

Many Pull Requests, especially first Pull Requests, require correction or updating. If you have used the GitHub interface to create your PR, you will need to close your PR, create a new branch, and re-submit. This is because you cannot squash your commits via the GitHub interface.

If you have a local copy of the repo, you can make the requested changes and amend your commit with: `git commit --amend` This will update your existing commit. When you push it to your fork you will need to do a force push to overwrite your old commit: `git push --force`

Be sure to post in the PR conversation that you have made the requested changes.

##Other resources
- [Searching for Your Issue on Github](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Searching-for-Your-Issue-on-Github)
- [Creating a New Github Issue](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Creating-a-New-Github-Issue)
- [Select Issues for Contributing Using Labels](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Select-Issues-for-Contributing-Using-Labels)
- [How to clone the FreeCodeCamp website on a Windows pc](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/How-to-clone-the-FreeCodeCamp-website-on-a-Windows-pc)
- [How to log in to your local FCC site - using GitHub](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/How-To-Log-In-To-Your-Local-FCC-Site)
- [Contributions Guide - With a demo on fixing a typo](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Contributions-Guide---with-Typo-Demo)
- [Writing great git commit message](https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Writing-great-git-commit-message)
- [Contributor Chat Support - For the FCC Repositories, and running a local instance] (https://gitter.im/FreeCodeCamp/HelpContributors)
