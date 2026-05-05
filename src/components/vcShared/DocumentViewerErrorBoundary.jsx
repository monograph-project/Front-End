import React from "react";
import { withTranslation } from "react-i18next";

/** Isolates heavy Syncfusion / diff viewers so crashes do not unwind the dashboard shell. */
export class DocumentViewerErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.error("[DocumentViewerErrorBoundary]", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-sm text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
          {this.props.t("documentViewer.errorBoundary")}
        </div>
      );
    }
    return this.props.children;
  }
}

const DocumentViewerErrorBoundary = withTranslation()(
  DocumentViewerErrorBoundaryInner,
);
DocumentViewerErrorBoundary.displayName = "DocumentViewerErrorBoundary";

export default DocumentViewerErrorBoundary;
