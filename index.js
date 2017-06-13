"use strict";
var React = require('react'),
    ReactDOM = require('react-dom'),
    S3Upload = require('./s3upload.js'),
    objectAssign = require('object-assign'),
    createClass = require('create-react-class');

var ReactS3Uploader = createClass({
    propTypes: {
        signingUrl: React.PropTypes.string,
        getSignedUrl: React.PropTypes.func,
        preprocess: React.PropTypes.func,
        onProgress: React.PropTypes.func,
        onFinish: React.PropTypes.func,
        onError: React.PropTypes.func,
        signingUrlMethod: React.PropTypes.string,
        signingUrlHeaders: React.PropTypes.object,
        signingUrlQueryParams: React.PropTypes.oneOfType([
          React.PropTypes.object,
          React.PropTypes.func
        ]),
        modifySigningUrlData: React.PropTypes.func,
        signingUrlWithCredentials: React.PropTypes.bool,
        uploadRequestHeaders: React.PropTypes.object,
        contentDisposition: React.PropTypes.string,
        server: React.PropTypes.string,
        scrubFilename: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            preprocess: function(file, next) {
                console.log('Pre-process: ' + file.name);
                next(file);
            },
            onProgress: function(percent, message) {
                console.log('Upload progress: ' + percent + '% ' + message);
            },
            onFinish: function(signResult, file) {
                console.log("Upload finished: " + file.name + " " + (signResult.publicUrl || signResult))
            },
            onError: function(message) {
                console.log("Upload error: " + message);
            },
            server: '',
            signingUrlMethod: 'GET',
            scrubFilename: function(filename) {
                return filename.replace(/[^\w\d_\-\.]+/ig, '');
            }
        };
    },

    handleChange: function() {
      this.fileElement = ReactDOM.findDOMNode(this)
      this.props.onChange && this.props.onChange(this.fileElement.files)
    },

    uploadFile: function() {
        this.myUploader = new S3Upload({
            fileElement: this.fileElement,
            signingUrl: this.props.signingUrl,
            getSignedUrl: this.props.getSignedUrl,
            preprocess: this.props.preprocess,
            onProgress: this.props.onProgress,
            onFinishS3Put: this.props.onFinish,
            onError: this.props.onError,
            signingUrlMethod: this.props.signingUrlMethod,
            signingUrlHeaders: this.props.signingUrlHeaders,
            signingUrlQueryParams: this.props.signingUrlQueryParams,
            modifySigningUrlData: this.props.modifySigningUrlData,
            signingUrlWithCredentials: this.props.signingUrlWithCredentials,
            uploadRequestHeaders: this.props.uploadRequestHeaders,
            contentDisposition: this.props.contentDisposition,
            server: this.props.server,
            scrubFilename: this.props.scrubFilename
        });
    },

    abort: function() {
        this.myUploader && this.myUploader.abortUpload();
    },

    clear: function() {
        clearInputFile(ReactDOM.findDOMNode(this));
    },

    render: function() {
        return React.DOM.input(this.getInputProps());
    },

    getInputProps: function() {
        var temporaryProps = objectAssign({}, this.props, {type: 'file', onChange: this.handleChange, multiple: true});
        var inputProps = {};

        var invalidProps = Object.keys(ReactS3Uploader.propTypes);

        for(var key in temporaryProps) {
            if(temporaryProps.hasOwnProperty(key) && invalidProps.indexOf(key) === -1) {
                inputProps[key] = temporaryProps[key];
            }
        }

        return inputProps;
    }
});

// http://stackoverflow.com/a/24608023/194065
function clearInputFile(f){
    if(f.value){
        try{
            f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
        }catch(err){ }
        if(f.value){ //for IE5 ~ IE10
            var form = document.createElement('form'),
                parentNode = f.parentNode, ref = f.nextSibling;
            form.appendChild(f);
            form.reset();
            parentNode.insertBefore(f,ref);
        }
    }
}

module.exports = ReactS3Uploader;
