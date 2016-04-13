/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import page from 'page';

/**
 * Internal dependencies
 */
import Site from 'my-sites/site';
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import * as PreviewActions from 'state/preview/actions';
import accept from 'lib/accept';
import DesignToolData from 'my-sites/design-menu/design-tool-data';
import DesignToolList from 'my-sites/design-tool-list';
import SiteTitleControl from 'my-sites/site-title';
import HeaderImageControl from 'my-sites/header-image';
import HomePageSettings from 'my-sites/home-page-settings';
import SiteLogoControl from 'my-sites/site-logo';

const designToolsById = {
	siteTitle: SiteTitleControl,
	headerImage: HeaderImageControl,
	homePage: HomePageSettings,
	siteLogo: SiteLogoControl,
};

const DesignMenu = React.createClass( {

	propTypes: {
		// These are provided by the connect method
		state: React.PropTypes.object.isRequired,
		isSaved: React.PropTypes.bool,
		customizations: React.PropTypes.object,
		selectedSite: React.PropTypes.object.isRequired,
		actions: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
			isSaved: true,
			customizations: {},
		};
	},

	getInitialState() {
		return {
			activeDesignTool: null,
			activePreviewDataKey: null,
		};
	},

	componentWillMount() {
		this.props.actions.clearCustomizations( this.props.selectedSite.ID );
		// Fetch the preview
		this.props.actions.fetchPreviewMarkup( this.props.selectedSite.ID, '' );
	},

	getDesignTools() {
		return [
			{
				label: this.translate( 'Site Title and Tagline' ),
				value: 'siteTitle',
			},
			{
				label: this.translate( 'Header Image' ),
				value: 'headerImage',
			},
			{
				label: this.translate( 'Site Logo' ),
				value: 'siteLogo',
			},
			{
				label: this.translate( 'Homepage Settings' ),
				value: 'homePage',
			},
		];
	},

	activateDesignTool( id ) {
		const activeDesignTool = designToolsById[ id ];
		this.setState( { activeDesignTool, activePreviewDataKey: id } );
	},

	activateDefaultDesignTool() {
		this.setState( { activeDesignTool: null, activePreviewDataKey: null } );
	},

	onSave() {
		this.props.actions.saveCustomizations();
	},

	onBack() {
		if ( this.state.activeDesignTool ) {
			return this.activateDefaultDesignTool();
		}
		this.maybeCloseDesignMenu();
	},

	maybeCloseDesignMenu() {
		if ( ! this.props.isSaved ) {
			return accept( this.translate( 'You have unsaved changes. Are you sure you want to close the preview?' ), accepted => {
				if ( accepted ) {
					this.props.actions.clearCustomizations( this.props.selectedSite.ID );
					this.closeDesignMenu();
				}
			} );
		}
		this.props.actions.clearCustomizations( this.props.selectedSite.ID );
		this.closeDesignMenu();
	},

	closeDesignMenu() {
		const siteSlug = this.props.selectedSite.URL.replace( /^https?:\/\//, '' );
		page( `/stats/${siteSlug}` );
		// TODO: go where?
	},

	renderActiveDesignTool() {
		return React.createElement( this.state.activeDesignTool );
	},

	renderDesignTool() {
		if ( ! this.state.activeDesignTool ) {
			return <DesignToolList tools={ this.getDesignTools() } onChange={ this.activateDesignTool } />;
		}
		return (
			<DesignToolData previewDataKey={ this.state.activePreviewDataKey } >
				{ this.renderActiveDesignTool() }
			</DesignToolData>
		);
	},

	renderSiteCard() {
		// The site object required by Site isn't quite the same as the one in the
		// Redux store, so we patch it.
		const site = assign( {}, this.props.selectedSite, {
			title: this.props.selectedSite.name,
			domain: this.props.selectedSite.URL.replace( /^https?:\/\//, '' ),
		} );
		return <Site site={ site } />;
	},

	render() {
		const saveButtonText = this.props.isSaved ? this.translate( 'Saved' ) : this.translate( 'Publish Changes' );
		return (
			<div className="design-menu">
				<span className="current-site__switch-sites">
					<Button compact borderless onClick={ this.onBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.translate( 'Back' ) }
					</Button>
					{ this.renderSiteCard() }
					<Card className="design-menu__header-buttons">
						<Button primary compact disabled={ this.props.isSaved } className="design-menu__save" onClick={ this.onSave } >{ saveButtonText }</Button>
					</Card>
				</span>
				{ this.renderDesignTool() }
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	const siteId = state.ui.selectedSiteId;
	const selectedSite = state.sites.items[ siteId ] || {};
	if ( ! state.preview || ! state.preview[ siteId ] ) {
		return { state, selectedSite };
	}
	return { state, selectedSite, customizations: state.preview[ siteId ].customizations, isSaved: state.preview[ siteId ].isSaved };
}

function mapDispatchToProps( dispatch ) {
	return {
		actions: bindActionCreators( PreviewActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( DesignMenu );
