// External dependencies
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import debugModule from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Internal dependencies
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import smartSetState from 'lib/react-smart-set-state';
import Notice from 'components/notice';
import { updateListDetails, dismissListNotice } from 'state/reader/lists/actions';
import { isUpdatedList, hasError } from 'state/reader/lists/selectors';

const debug = debugModule( 'calypso:reader:list-management' );

const ListManagementDescriptionEdit = React.createClass( {

	mixins: [ LinkedStateMixin ],
	smartSetState: smartSetState,

	propTypes: {
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	getInitialState() {
		return Object.assign( {
			title: '',
			description: '',
		}, this.getState( this.props ) );
	},

	getState( props ) {
		const list = props.list;
		const currentState = {};
		if ( list && list.ID ) {
			currentState.ID = list.ID;
			currentState.title = list.title;
			currentState.description = list.description;
		}
		return currentState;
	},

	componentWillReceiveProps( nextProps ) {
		this.smartSetState( this.getState( nextProps ) );

		if ( nextProps.list.ID !== this.props.list.ID ) {
			this.handleDismissNotice();
		}
	},

	componentWillUnmount() {
		this.handleDismissNotice();
	},

	handleFormSubmit() {
		this.handleDismissNotice();

		const params = {
			ID: this.props.list.ID,
			owner: this.props.list.owner,
			slug: this.props.list.slug,
			title: this.state.title,
			description: this.state.description
		};

		this.props.updateListDetails( params );
	},

	handleDismissNotice() {
		this.props.dismissListNotice( this.props.list.ID );
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		let notice = null;
		if ( this.props.isUpdatedList ) {
			notice = <Notice status="is-success" text={ this.translate( 'List details saved successfully.' ) } onDismissClick={ this.handleDismissNotice } />;
		}

		if ( this.props.hasError ) {
			notice = <Notice status="is-error" text={ this.translate( 'Sorry, there was a problem saving your list details.' ) } onDismissClick={ this.handleDismissNotice } />;
		}

		const isTitleMissing = ! this.state.title || this.state.title.length < 1;

		return (
			<div className="list-management-description-edit">
				{ notice }
				<Card>
					<FormFieldset>
						<FormLabel htmlFor="list-title">Title</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="on"
							autoCorrect="off"
							id="list-title"
							name="list-title"
							ref="listTitle"
							required
							className={ isTitleMissing ? 'is-error' : '' }
							placeholder=""
							valueLink={ this.linkState( 'title' ) } />
						{ isTitleMissing ? <FormInputValidation isError text={ this.translate( 'Title is a required field.' ) } /> : '' }
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="list-description">Description</FormLabel>
						<FormTextarea
							ref="listDescription"
							name="list-description"
							id="list-description"
							placeholder=""
							valueLink={ this.linkState( 'description' ) }></FormTextarea>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton disabled={ isTitleMissing } onClick={ this.handleFormSubmit }>{ this.translate( 'Save Changes' ) }</FormButton>
					</FormButtonsBar>
				</Card>
			</div>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		return {
			isUpdatedList: isUpdatedList( state, ownProps.list.ID ),
			hasError: hasError( state, ownProps.list.ID )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			updateListDetails,
			dismissListNotice
		}, dispatch );
	}
)( ListManagementDescriptionEdit );
