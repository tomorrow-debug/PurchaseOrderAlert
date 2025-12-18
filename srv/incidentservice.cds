using scp.cloud from '../db/schema';

service PurchaseRequestService @(path: '/odata/v4/purchase-request') {

    @odata.draft.enabled
    @odata.draft.bypass
    @Aggregation.ApplySupported : {
        $Type : 'Aggregation.ApplySupportedType',
        Transformations : [
            'aggregate',
            'groupby',
            'filter'
        ],
        Rollup : #None,
        PropertyRestrictions : true
    }
    entity PurchaseRequests        as projection on cloud.PurchaseRequests {
        *,
        1 as recordCount : Integer @title: 'Record Count',
        priority.name as priorityName : String @title: 'Priority Name',
        priority.criticality as priorityCriticality : Integer @title: 'Priority Criticality'
    };

    @readonly
    entity PurchaseFlow            as projection on cloud.PurchaseFlow;

    @readonly
    entity PurchaseProcessTimeline as projection on cloud.PurchaseProcessTimeline;

    @readonly
    entity Individual              as projection on cloud.Individual;

    @readonly
    entity OrderUnit               as projection on cloud.OrderUnit;

    @readonly
    entity Currency                as projection on cloud.Currency;

    @readonly
    entity Priority                as projection on cloud.Priority;

    @readonly
    entity RequestStatus           as projection on cloud.RequestStatus;

    @readonly
    entity Supplier                as projection on cloud.Supplier;

}
