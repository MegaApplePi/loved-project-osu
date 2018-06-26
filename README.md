# loved-project-osu

## Instructions

### Prerequisites

First, you will need these:

- sass
- node

### Compiling and starting

Open the terminal to the cloned location and run `npm run dev` to compile the Sass and Javascript files (after this, you can use `npm run start` instead).

If `npm run dev` fails (because you are on Windows, for example), use `npm run pack` and `npm run sass` (in any order; once the command compiles the files, use `Ctrl` + `C` to kill the process and start the other one). Once this is done, you can use `npm run start` to start the program.

### Usage

Inside the `dev` folder, there is another folder called `loved`. This folder is intended to be the sample folder for what the dropped folder should look like. Copy it and paste it into another location, such as your Desktop (you don't really have to this and just use this folder if you really want to). Henceforth, this new folder will be referenced as `loved`.

Inside the `loved` folder should be a `config.yaml` file for your osu!api key, if you choose to include it, and values that you can enter to override the osu!api values, should the osu!api not provide the wanted values. See [#Config](#config) for config and overrides.

For this to work, delete the sample background images, if you hadn't already. Now you must gather the background images (Download the beatmapsets and load them into osu!, go to your `Songs` folder, and copy/paste them into the `loved` folder). **Make sure you rename the images to their beatmapset id number!**

Click and drag the image up or down to position the image. Then press `Enter` to advance to the next image.

Once the images and config file are ready, drag the `loved` folder into the window. If everything works out, a new folder called `output` inside the `loved` should be created along with the project loved images (this should open automatically, if it didn't).

## Config

Notice: Pay close attention to indentation and hyphenated values! Misusing these may cause a YAML parsing error.

In the examples below, `369623` is the beatmapset id. This must correspond to an image in the `loved` folder.

Note: If you are using the osu!api, you only need to include beatmapset ids for those you want to override (probably for creators).

Note: If the osu!api key is invalid/missing and there are no overrides found, the replacement character `�` is used.

### osu!api key

Note: If you want to just use the osu!api values, this is all you need in the config.yaml file. If you don't, you must input the title, song, and creator(s) for each image in the `loved` folder.

```yaml
"key": "YOUR_API_KEY"
```

### Title

Title must be a string value.

```yaml
"369623":
  "title": "Nice Title"
```

### Artist

Artist must be a string value.

```yaml
"369623":
  "artist": "Cool Dude"
```

### Single creator

```yaml
"369623":
  "creator": "clayton"
```

---

This works too:

```yaml
"369623":
  "creator":
  -  "clayton"
```

### Multiple creators

```yaml
"369623":
  "creator":
  -  "clayton"
  -  "mangomizer"
  -  "peppy"
```

### Creator with "et al."

```yaml
"369623":
  "creator":
  -  "clayton"
  -  "et al."
```

Note: `et al.` is recognized as a keyword, not a username (it's an invalid username anyways), this any names proceeding after this value will be ignored (since "et al." is supposed to be at the very end anyways).

### Putting it all together

So this is what it could look like:

```yaml
"key": "YOUR_API_KEY"
"369623":
  "creator":
  -  "clayton"
  -  "mangomizer"
  -  "kaifin"
  "artist": "Real Artist Name"
"227021":
  "creator":
  -  "MegaApple_Pi"
  -  "et al."
  "title": "Wrong one, so here's a better title"
"89429":
  "creator":
  -  "peppy"
  -  "Ephemeral"
```
