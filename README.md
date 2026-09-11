# Battle Companies Turn Prompter

A small, phone-friendly static web app. It needs no account, database, subscription, or build step.

## Preview locally

The quickest option is to open `index.html` directly. The turn flow and saved counters work immediately.

To test installation and offline use, serve the folder over a local web server instead:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. Service workers do not run when a page is opened as a plain `file://` URL.

## Publish free with GitHub Pages

1. Create a new public GitHub repository, for example `battle-companies-prompter`.
2. Upload every file in this folder to the repository root and commit the changes.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then click **Save**.
6. GitHub will show the public address when publishing finishes.

On iPhone or iPad, open that address in Safari, tap **Share**, then **Add to Home Screen**. On Android, open it in Chrome and choose **Install app** or **Add to Home screen**.

## Rules sources

The concise reminders are grounded in the supplied *Middle-earth Strategy Battle Game Rules Manual* and *Middle-earth SBG: Battle Companies*. Page references in the app use the printed page numbers. The app deliberately reminds rather than reproduces the full rules; consult the books and the current scenario where details matter.
