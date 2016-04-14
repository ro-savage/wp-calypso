/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';
import HappinessSupport from 'components/happiness-support';
import PremiumPlanDetails from './premium-plan-details';
import BusinessPlanDetails from './business-plan-details';
import CheckoutThankYouFeaturesHeader from './features-header';
import CheckoutThankYouHeader from './header';
import sitesList from 'lib/sites-list';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { shouldFetchSitePlans } from 'lib/plans';
import {
	isBusiness,
	isPremium,
	isFreePlan
} from 'lib/products-values';

export default function( context ) {
	const sites = sitesList();
	const selectedSite = sites.getSelectedSite();

	if ( shouldFetchSitePlans( getPlansBySite( context.store.getState(), selectedSite ), selectedSite.ID ) ) {
		context.store.dispatch( fetchSitePlans( selectedSite.ID ) );
	}

	const PlanDetailsComponent = React.createClass( {
		render: function() {
			const { hasLoadedFromServer } = this.props.sitePlans;
			return (
				<Main className="checkout-thank-you">
					<Card className="checkout-thank-you__content">
						<CheckoutThankYouHeader
							isDataLoaded={ true }
							primaryPurchase={ this.props.selectedSite.plan }
							selectedSite={ this.props.selectedSite } />

							<CheckoutThankYouFeaturesHeader
								isDataLoaded={ hasLoadedFromServer }
								isGenericReceipt={ true }
							/>

							<div className="checkout-thank-you__purchase-details-list">
								{ hasLoadedFromServer && isPremium( this.props.selectedSite.plan ) &&
									<PremiumPlanDetails
										selectedSite={ this.props.selectedSite }
										sitePlans={ this.props.sitePlans }
									/>
								}
								{ hasLoadedFromServer && isBusiness( this.props.selectedSite.plan ) &&
									<BusinessPlanDetails
										selectedSite={ this.props.selectedSite }
										sitePlans={ this.props.sitePlans }
									/>
								}
							</div>
					</Card>

					<Card className="checkout-thank-you__footer">
						<HappinessSupport
							isJetpack={ false }
							isPlaceholder={ false } />
					</Card>
				</Main>
			);
		}
	} );

	const ConnectedComponent = connect(
		( state, props ) => {
			return {
				sitePlans: getPlansBySite( state, props.selectedSite )
			};
		}
	)( PlanDetailsComponent );

	if ( selectedSite.jetpack || isFreePlan( selectedSite.plan ) ) {
		page.redirect( '/plans/' + selectedSite.slug );
	} else {
		renderWithReduxStore(
			<ConnectedComponent selectedSite={ selectedSite }/>,
			document.getElementById( 'primary' ),
			context.store
		);
	}
}
