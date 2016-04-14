import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

import Gridicon from 'components/gridicon';

/**
 * Detect if the given url is a fully formed url
 *
 * @param {String} url - url to check
 * @return {Boolean} True if it's a fully formed url
 */

const isFullyFormedURL = url => {
	return /^https?:\/\//.test( url );
};

export const BusinessPlugin = React.createClass( {
	render() {
		const {
			description,
			icon = 'plugins',
			name,
			plan,
			onClick = noop,
			supportLink,
		} = this.props;

		const target = isFullyFormedURL( supportLink ) ? '_blank' : '_self';

		return (
			<div className="wpcom-plugins__plugin-item">
				<a onClick={ onClick } href={ supportLink } target={ target }>
					<div className="wpcom-plugins__plugin-icon">
						<Gridicon { ...{ icon } } />
					</div>
					<div className="wpcom-plugins__plugin-title">{ name }</div>
					<div className="wpcom-plugins__plugin-plan">{ plan }</div>
					<p className="wpcom-plugins__plugin-description">{ description }</p>
				</a>
			</div>
		);
	}
} );

BusinessPlugin.propTypes = {
	name: PropTypes.string.isRequired,
	supportLink: PropTypes.string.isRequired,
	icon: PropTypes.string,
	onClick: PropTypes.func,
	plan: PropTypes.string.isRequired,
	description: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.element
	] ).isRequired
};

export default BusinessPlugin;
