import React, { Component } from "react";
import { Section } from "../../Service/Section";
import "./index.css";

export interface SectionsProps {
  sections: Section[];
}

export default class Sections extends Component<SectionsProps> {
  render() {
    const { sections } = this.props;
    return (
      <div className="yw-sections">
        {sections.map((section, i) => {
          return (
            <div key={i} className="yw-section">
              {section.title && section.title !== "" ? (
                <div className="yw-section-title">{section.title}</div>
              ) : undefined}

              <div className="yw-channelsetting-section-rows">
                {section.rows?.map((row, j) => {
                  return (
                    <div key={j} className="yw-section-row">
                      <row.cell {...row.properties}></row.cell>
                    </div>
                  );
                })}
              </div>
              {section.subtitle && section.subtitle !== "" ? (
                <div className="yw-section-subtitle">{section.subtitle}</div>
              ) : undefined}
            </div>
          );
        })}
      </div>
    );
  }
}
