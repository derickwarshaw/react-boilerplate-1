/* eslint react/no-danger: 0 */

import React, { PropTypes, PureComponent } from 'react';
import htmlescape from 'htmlescape';


export default class HtmlDocument extends PureComponent {
  static propTypes = {
    head: PropTypes.object.isRequired,
    appMarkup: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    assets: PropTypes.shape({
      main: PropTypes.shape({
        js: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    webpackDllNames: PropTypes.arrayOf(PropTypes.string),
  };

  addDLLsWhenIsDevelop(webpackDllNames) {
    if (process.env.NODE_ENV === 'development' && !!webpackDllNames) {
      return webpackDllNames.map((dllName) =>
        <script data-dll key={dllName} src={`/${dllName}.dll.js`}></script>
      );
    }
    return null;
  }

  render() {
    const { head, appMarkup, state, assets, webpackDllNames } = this.props;
    const attrs = head.htmlAttributes.toComponent();

    return (
      <html lang="en" {...attrs}>

        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta name="mobile-web-app-capable" content="yes" />

          {head.title.toComponent()}
          {head.meta.toComponent()}
          <link rel="icon" type="image/png" href={require('./images/favicon.png')} />

          <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" />
          <link href={assets.main.css} rel="stylesheet" />
        </head>

        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: appMarkup }} />

          <script dangerouslySetInnerHTML={{ __html: `APP_STATE = ${htmlescape(state)}` }} />

          {this.addDLLsWhenIsDevelop(webpackDllNames)}

          <script type="text/javascript" src={assets.main.js}></script>
        </body>
      </html>
    );
  }
}
