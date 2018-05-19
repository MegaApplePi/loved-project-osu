# loved-project-osu

## Instructions

First, you will need these:

- sass
- node

---

Open the terminal to the cloned location and run `npm run dev` to compile the Sass and Javascript files (after this, you can use `npm run start` instead).

Inside the `dev` folder, there is another folder called `loved`. This folder is the sample folder of what the dropped folder should look like, along with a config file. The config file should have your osu! api key inside it to run osu! api calls. If you don't include it, you must define the creator, artist, and title for each beatmapset in this config file!

For this to work, include the background images you need and rename them to their beatmapset id, keep the extension. You should not need to crop the images, as they will be resized and positioned automatically (positioning may look weird with some images). The config file can be used to override the osu! api values.

Once that is done, simply drag the `loved` folder into the window and if everything worked out, a new folder called `output` inside the folder that was dropped should be created along with the project loved images.
