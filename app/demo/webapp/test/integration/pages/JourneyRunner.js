sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"demo/purchaserequest/test/integration/pages/IncidentsList",
	"demo/purchaserequest/test/integration/pages/IncidentsObjectPage"
], function (JourneyRunner, PurchaseRequestList, PurchaseRequestObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('demo/purchaserequest') + '/test/flpSandbox.html#demopurchaserequest-tile',
        pages: {
			onThePurchaseRequestList: PurchaseRequestList,
			onThePurchaseRequestObjectPage: PurchaseRequestObjectPage
        },
        async: true
    });

    return runner;
});

