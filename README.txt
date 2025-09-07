Greetings! If you're reading this you probably forgot why there's a gh-pages and a master branch and a build script for a static github.io website.

Since ./pages/api/contributions.ts requires the use of a API call with a secret key, this application needs to be partly hosted on a website like Vercel.
At the same time, it is cleaner to use the github.io domain without user-prompt-inducing redirections.
So the Next app has to be built in a static manner - see the next.config.ts script inside build.sh.
This allows Vercel to normally deploy the master branch while gh-pages serves the static page which in turn queries Vercel.
