import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Prism } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Highlight(props: {
    value: string,
    language: string
}) {

    const { language, value } = props;
    return (
        <Prism language={language} style={coy}>
            {value}
        </Prism>
    );

}