# Download latest release from Atom

Default settings download Linux 64-bits version of Atom and extracts to an existing directory `/opt/atom-wrapper/atom`.

Directory must exist and user must have permissions to write to it.

## Usage

Edit `config.json` to change some configurations, such as the architecture to download
or where to extract the contents.

```
npm start
```

That's it!

## Executable

In order for atom to run in background I've added the following script to `/usr/local/bin`


```
#!/bin/bash

ATOM_DIR=/opt/atom

nohup $ATOM_DIR/atom $@ > /dev/null 2> /dev/null &
```

*note:* change `ATOM_DIR` for the directory where you are installing
