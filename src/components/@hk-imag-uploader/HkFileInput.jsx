import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Image } from 'react-bootstrap';
import { DropzoneComponent } from 'react-dropzone-component';
// import { Upload } from 'react-feather';

const HkFileInput = ({ children, className }) => {

    //DropZone Config
    var djsConfig = {
        addRemoveLinks: true,
        acceptedFiles: "image/jpeg,image/png,image/gif",
        autoProcessQueue: false,
        uploadprogress: 100,
        previewTemplate: ReactDOMServer.renderToStaticMarkup(
            <div className="dz-preview dz-file-preview">
                <Image data-dz-thumbnail="true" alt="img" fluid roundedCircle />
            </div>
        )

    };
    var componentConfig = {
        iconFiletypes: [".jpg", ".jpeg", ".png", ".gif"],
        showFiletypeIcon: true,
        postUrl: "no-url",
        maxFiles: 1,
        inputContent: "Drop Files (Custom Preview)"

    };

    return (
        <DropzoneComponent
            config={componentConfig}
            djsConfig={djsConfig}
            className={className}
        >
            {/* <span className="dz-default dz-message">
                <Row className="text-muted mb-2">
                    <Col><Upload /></Col>
                </Row>
                <Row>
                    <Col>{children}</Col>
                </Row>
            </span> */}
        </DropzoneComponent>
    )
}

export default HkFileInput;
