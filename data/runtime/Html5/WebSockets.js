CRunWebSockets.CND_NEWMESSAGE = 0;
CRunWebSockets.CND_ISCONNECTED = 1;
CRunWebSockets.CND_ONERROR = 2;
CRunWebSockets.CND_ONCLOSE = 3;
CRunWebSockets.CND_LAST = 4;

CRunWebSockets.ACT_OPENSOCKET = 0;
CRunWebSockets.ACT_SENDMESSAGE = 1;
CRunWebSockets.ACT_CLOSE = 2;

CRunWebSockets.EXP_GETMESSAGE = 0;
CRunWebSockets.EXP_GETERROR = 1;
CRunWebSockets.EXP_GETCLOSERES = 2;

function CRunWebSockets()
{
    this.messages = {};
    this.errors = {};
}

CRunWebSockets.prototype = CServices.extend(new CRunExtension(), {
    getNumberOfConditions: function() {
        return CRunWebSockets.CND_LAST;
    },
    createRunObject: function(file, cob, version) {
        return true;
    },
    condition: function(num, cnd) {
        switch (num)
        {
            case CRunWebSockets.CND_NEWMESSAGE:

                var name = cnd.getParamExpString(this.rh, 0);

                if (this.messages[name].newmsg === true) {
                    this.messages[name].newmsg = false;
                    return true;
                }

                return false;

            case CRunWebSockets.CND_ISCONNECTED:

                var name = cnd.getParamExpString(this.rh, 0);

                if (this.messages[name].cnstat === true) {
                    this.messages[name].cnstat = false;
                    return true;
                }

                return false;

            case CRunWebSockets.CND_ONERROR:

                var name = cnd.getParamExpString(this.rh, 0);

                if (this.errors[name].newmsg === true) {
                    this.errors[name].newmsg = false;
                    return true;
                }

                return false;

            case CRunWebSockets.CND_ONCLOSE:

                var name = cnd.getParamExpString(this.rh, 0);
                var stat = this.messages[name].closed;
                var wasclean = cnd.getParamExpString(this.rh, 1);

                wasclean = wasclean === "clean" || wasclean === "dirty" ? wasclean : 'clean';
                
                if (wasclean === 'clean' && this.messages[name].closeclean === true && stat === true) {
                    this.messages[name].closed = false;
                    return true;
                }
                
                if (wasclean === 'dirty' && this.messages[name].closeclean === false && stat === true) {
                    this.messages[name].closed = false;
                    return true;
                }
                
                return false;
        }
        return false;
    },
    action: function(num, act) {
        switch (num)
        {
            case CRunWebSockets.ACT_OPENSOCKET:
                try {

                    var name = act.getParamExpString(this.rh, 0);
                    var address = act.getParamExpString(this.rh, 1);
                    var port = act.getParamExpString(this.rh, 2);
                    //var protocol = act.getParamExpString(this.rh, 3);

                    port = port !== 0 ? port : 80;
                    if (!this.messages[name]) {
                        this.messages[name] = {};
                    }

                    this.messages[name].ws = new WebSocket("ws://" + address + ":" + port + "/");

                    var that = this;

                    this.messages[name].ws.onerror = function(event) {
                        that.repError(name, "Could not Connect to host!");
                    };

                    this.messages[name].ws.onopen = function(event) {
                        that.messages[name].cnstat = true;
                        that.ho.generateEvent(CRunWebSockets.CND_ISCONNECTED, 0);
                    };

                    this.messages[name].ws.onmessage = function(event) {
                        that.messages[name].message = event.data;
                        that.messages[name].newmsg = true;
                        that.ho.generateEvent(CRunWebSockets.CND_NEWMESSAGE, 0);
                    };

                    this.messages[name].ws.onclose = function(event) {
                        that.messages[name].closed = true;
                        that.messages[name].closeres = event.reason;
                        that.messages[name].closeclean = event.wasClean;
                        that.ho.generateEvent(CRunWebSockets.CND_ONCLOSE, 0);
                    };

                } catch (err) {
                    this.repError(name, err);
                }
                break;

            case CRunWebSockets.ACT_SENDMESSAGE:
                try {
                    var name = act.getParamExpString(this.rh, 0);
                    var message = act.getParamExpString(this.rh, 1);
                    this.messages[name].ws.send(message);
                } catch (err) {
                    this.repError(name, err);
                }
                break;

            case CRunWebSockets.ACT_CLOSE:
                try {
                    var name = act.getParamExpString(this.rh, 0);

                    if (this.messages[name].ws.close()) {
                        delete this.messages[name];
                    }
                } catch (err) {
                    this.repError(name, err);
                }
                break;
        }
    },
    repError: function(name, err) {

        if (!this.errors[name]) {
            this.errors[name] = {};
        }
        this.errors[name].newmsg = true;
        this.errors[name].message = err;
        this.ho.generateEvent(CRunWebSockets.CND_ONERROR, 0);

    },
    expression: function(num) {
        switch (num)
        {
            case CRunWebSockets.EXP_GETMESSAGE:
                var name = this.ho.getExpParam();
                return this.messages[name].message;

            case CRunWebSockets.EXP_GETERROR:
                var name = this.ho.getExpParam();
                return this.errors[name].message;
                
            case CRunWebSockets.EXP_GETERROR:
                var name = this.ho.getExpParam();
                return this.errors[name].closeres;
        }
        return 0;
    }
});
