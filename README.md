# Adobe Animate Webpack Loader
This webpack loader will load javascript exported directly from Adobe Animate, and convert it into a commonjs module consumable by webpack. It will also normalize output so that you don't need to know the name of the root timeline / filename when exported. This makes it simpler to create asset (runtime) loader libraries without knowing the name of the root timeline beforehand. You can just create a new instance through `new library.Root()` and you're off to the races. So any animation you simply need to know the path to it:
```
const createjs = require('createjs');
const project = require('./assets/animations/my-create-js-project.js');
const library = animation.makeDefinition(createjs);
// TODO: add directions for loading the library assets as a next step
const movie = new library.Root();
```

By decoupling the CreateJS library, which is used by Adobe Animate's HTML5 export, it makes it possible to lazy load the CreateJS libraries via webpack's import() statement. This gives more control, allowing your main javascript bundle to exclude CreateJS and your animations until when they are needed.

Lastly, we make webpack aware of the images in the manifest for your library by replacing relative image paths to your javascript and wrapping them in require() calls, so the images will be bundled along with the rest of your animation. This makes it much easier to manage your image dependencies. It allows you to keep the folder structure that Adobe Animate exports directly, and webpack will automatically bundle all the dependencies for you. This requires having image-loader configured already in your webpack setup

## How to use
First, you'll need to make sure you have createJS as a dependency of your project:

`yarn add createjs`

You'll need to make some adjustments to your webpack.config.js in order to let webpack recognize the modules, as they don't work out of the box (this is a known issue with this project).

Just add this to your webpack.config.js file:
```
        resolve: {
            alias: {
                createjs: 'createjs/builds/1.0.0/createjs.js'
            }
        },
        module: {
            rules: [
                {
                    test: /node_modules[/\\]createjs/,
                    loaders: [
                        'imports-loader?this=>window',
                        'exports-loader?window.createjs'
                    ]
                }
            ]
        }


```

Now CreateJS animations are ready to be packed!

Next, install the adobe-animate-loader into your webpack project 
`yarn add -D volkipp/adobe-animate-loader`
or if you enjoy npm: 
`npm i volkipp/adobe-animate-loader --save-dev`

You'll need to dedicate a folder to only put your CreateJS animations. In this example, any .js file in src/assets/animation will be loaded through the adobe-animate-loader. 

Just add this into your webpack.config.js file in the module.rules array. :
```
    {
        test: /\.js$/,
        include: [
            path.resolve(__dirname, "src/assets/animation")
        ],
        use: [
            { loader: 'adobe-animate-loader' }
        ]
    }
```

## TODO
- [ ] Publish to npm
- [ ] Document export settings for Adobe Animate
- [ ] Add example project
- [ ] Publish the companion runtime library asset loader
