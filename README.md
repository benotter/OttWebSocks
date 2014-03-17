OttWebSocks
===========

A basic WebSockets extension for the HTML5 Runtime of Clickteam Fusion 2.5

To install,
Copy both 'Data', and 'Extension' directories into the main Clickteam Fusion 2.5 directory,

Then navigate to 'Data/Runtime/Html5/'

Then FIRST BACKUP and open 'RuntimeDev.js', then add the line:

        document.write('<script src="' + document.srcPath + 'WebSockets.js"></script>');

around line 125,

Then FIRST BACKUP and open 'Extensions.js', then add the lines:

    	if (this.name == "WebSockets")
    	    return new CRunWebSockets();

around line 225.

After that, restart the editor, and do a full rebuilt on your HTML5 Project,
It should be working after that.
