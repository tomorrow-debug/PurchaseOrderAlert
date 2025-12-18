using PurchaseRequestService as service from '../srv/incidentservice';

// Define aggregation capabilities
annotate service.PurchaseRequests with @Aggregation.ApplySupported : {
    Transformations : [
        'aggregate',
        'groupby',
        'filter'
    ],
    Rollup : #None,
    PropertyRestrictions : true,
    GroupableProperties : [
        priorityName,
        material,
        deliveryDate,
        identifier,
        shortText,
        purchaseOrder
    ],
    AggregatableProperties : [
        {
            Property : recordCount,
            SupportedAggregationMethods : [
                sum,
                min,
                max,
                avg
            ],
            RecommendationListRanking : 1
        },
        {
            Property : purchaseQuantity
        },
        {
            Property : totalValue
        },
        {
            Property : price
        }
    ]
};

// Define which properties can be aggregated and grouped
annotate service.PurchaseRequests with {
    // Record count for counting number of records
    recordCount @Analytics.Measure @Aggregation.default: #SUM @Common.Label: 'Number of Requests';
    
    // Measures (aggregatable)
    purchaseQuantity @Analytics.Measure @Aggregation.default: #SUM;
    totalValue @Analytics.Measure @Aggregation.default: #SUM;
    price @Analytics.Measure @Aggregation.default: #AVG;
    
    // Dimensions (groupable)
    priorityName @Analytics.Dimension @Common.Label: 'Priority';
    material @Analytics.Dimension;
    deliveryDate @Analytics.Dimension;
};

// DataPoint for count display with criticality
annotate service.PurchaseRequests with @UI.DataPoint #CountRequests : {
    Value : recordCount,
    Title : 'Count of Requests',
    Criticality : priorityCriticality
};

annotate service.PurchaseRequests with @(
    UI : {
    //the lineItem annotation defines the table columns for UI display of the annotated entity
    LineItem : [
        {
            $Type       : 'UI.DataField',
            Value       : '●',
            Label       : '',
            Criticality : priority.criticality,
            ![@HTML5.CssDefaults] : {width : '3rem'}
        },
        {
            $Type : 'UI.DataField',
            Value : identifier,
            Label : 'PR Number'
        },
        {
            $Type : 'UI.DataField',
            Value : material,
            Label : 'Material'
        },
        {
            $Type : 'UI.DataField',
            Value : shortText,
            Label : 'Description'
        },
        {
            $Type                     : 'UI.DataField',
            Value                     : priority_code,
            Label                     : 'Priority',
            Criticality               : priority.criticality,
            CriticalityRepresentation : #WithoutIcon
        },
        {
            $Type : 'UI.DataField',
            Value : requestStatus_code,
            Label : 'Status'
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseQuantity,
            Label : 'Quantity'
        },
        {
            $Type : 'UI.DataField',
            Value : totalValue,
            Label : 'Total Value'
        },
        {
            $Type : 'UI.DataField',
            Value : deliveryDate,
            Label : 'Delivery Date'
        }
    ],
        
    SelectionFields : [
        requestStatus_code,
        priority_code,
        supplier_ID,
        deliveryDate
    ],

    // Default sorting by priority (High -> Medium -> Low)
    PresentationVariant : {
        SortOrder : [{
            Property   : priority_code,
            Descending : false  // 1_high < 2_medium < 3_low, so ascending order shows High first
        }],
        Visualizations : ['@UI.LineItem'],
        RequestAtLeast : [priority.criticality]
    },

    // Presentation variant for chart view
    PresentationVariant #ChartByPriority : {
        Visualizations : ['@UI.Chart#PurchaseRequestsByPriority'],
        SortOrder : [{
            Property   : priority_code,
            Descending : false
        }]
    },

    PresentationVariant #ChartByStatus : {
        Visualizations : ['@UI.Chart#PurchaseRequestsByStatus']
    },

    // Selection Presentation Variant combining filters and visualizations
    SelectionPresentationVariant #TableView : {
        SelectionVariant : {
            SelectOptions : []
        },
        PresentationVariant : ![@UI.PresentationVariant]
    },

    SelectionPresentationVariant #ChartView : {
        SelectionVariant : {
            SelectOptions : []
        },
        PresentationVariant : ![@UI.PresentationVariant#ChartByPriority]
    },

    // DataPoint for priority indicator (red/yellow/green)
    DataPoint #priorityIndicator : {
        Value                         : priority_code,
        Criticality                   : priority.criticality,
        CriticalityRepresentation     : #WithoutIcon
    },
    
    // DataPoint for status indicator in first column
    DataPoint #PriorityStatus : {
        Value       : priority_code,
        Criticality : priority.criticality
    },

    // Chart definition for analytical view
    Chart #PurchaseRequestsByPriority : {
        $Type : 'UI.ChartDefinitionType',
        Title : 'Purchase Requests Count by Priority',
        Description : 'Number of Purchase Requests grouped by Priority',
        ChartType : #Column,
        Dimensions : [priorityName],
        Measures : [recordCount],
        MeasureAttributes : [{
            $Type : 'UI.ChartMeasureAttributeType',
            Measure : recordCount,
            Role : #Axis1,
            DataPoint : '@UI.DataPoint#CountRequests'
        }],
        DimensionAttributes : [{
            $Type : 'UI.ChartDimensionAttributeType',
            Dimension : priorityName,
            Role : #Category
        }]
    },

    Chart #PurchaseRequestsByStatus : {
        $Type : 'UI.ChartDefinitionType',
        Title : 'Total Value by Status',
        ChartType : #Bar,
        Dimensions : [requestStatus_code],
        Measures : [totalValue],
        MeasureAttributes : [{
            $Type : 'UI.ChartMeasureAttributeType',
            Measure : totalValue,
            Role : #Axis1
        }],
        DimensionAttributes : [{
            $Type : 'UI.ChartDimensionAttributeType',
            Dimension : requestStatus_code,
            Role : #Category
        }]
    },

    //	Information for the header area of an entity representation
    HeaderInfo : {
        TypeName       : 'Purchase Request',
        TypeNamePlural : 'Purchase Requests',
        TypeImageUrl   : 'sap-icon://cart',
        Title          : {Value : identifier},
        Description    : {Value : shortText}
    },

    //Facets for additional object header information (shown in the object page header)
    HeaderFacets                         : [{
        $Type  : 'UI.ReferenceFacet',
        Target : '@UI.FieldGroup#HeaderGeneralInformation'
    }],

    //Group of fields with an optional label
    FieldGroup #HeaderGeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                Value : priority_code,
                Label : 'Priority'
            },
            {
                Value : requestStatus_code,
                Label : 'Status'
            },
            {
                Value : totalValue,
                Label : 'Total Value'
            },
            {
                $Type  : 'UI.DataFieldForAnnotation',
                Target : 'contactPerson/@Communication.Contact',
                Label  : 'Contact Person'
            }
        ]
    },

    FieldGroup #PurchaseRequestDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : identifier,
                Label : 'PR Number'
            },
            {
                $Type : 'UI.DataField',
                Value : purchaseOrder,
                Label : 'PO Number'
            },
            {
                $Type : 'UI.DataField',
                Value : project,
                Label : 'Project'
            },
            {
                $Type : 'UI.DataField',
                Value : material,
                Label : 'Material'
            },
            {
                $Type : 'UI.DataField',
                Value : shortText,
                Label : 'Description'
            }
       ]
    },

    FieldGroup #QuantityAndPrice : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : purchaseQuantity,
                Label : 'Purchase Quantity'
            },
            {
                $Type : 'UI.DataField',
                Value : orderUnit_code,
                Label : 'Order Unit'
            },
            {
                $Type : 'UI.DataField',
                Value : price,
                Label : 'Price'
            },
            {
                $Type : 'UI.DataField',
                Value : currency_code,
                Label : 'Currency'
            },
            {
                $Type : 'UI.DataField',
                Value : totalValue,
                Label : 'Total Value'
            }
        ]
    },

    FieldGroup #DateInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : requestDate,
                Label : 'Request Date'
            },
            {
                $Type : 'UI.DataField',
                Value : approvalDate,
                Label : 'Approval Date'
            },
            {
                $Type : 'UI.DataField',
                Value : deliveryDate,
                Label : 'Delivery Date'
            }
        ]
    },

    FieldGroup #OrganizationDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : supplier_ID,
                Label : 'Supplier'
            },
            {
                $Type : 'UI.DataField',
                Value : frameworkAgreement,
                Label : 'Framework Agreement'
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingOrganization,
                Label : 'Purchasing Organization'
            },
            {
                $Type : 'UI.DataField',
                Value : purchasingGroup,
                Label : 'Purchasing Group'
            },
            {
                $Type : 'UI.DataField',
                Value : deliveryAddress,
                Label : 'Delivery Address'
            }
        ]
    },

    //object page content area is organized by facets referring to e.g. fieldgroup and lineItem annotations
    Facets : [
        {
            $Type  : 'UI.CollectionFacet',
            Label  : 'Purchase Request Overview',
            ID     : 'PurchaseRequestOverviewFacet',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Request Details',
                    ID     : 'PurchaseRequestDetailsFacet',
                    Target : '@UI.FieldGroup#PurchaseRequestDetails'
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Quantity & Price',
                    ID     : 'QuantityAndPriceFacet',
                    Target : '@UI.FieldGroup#QuantityAndPrice'
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Date Information',
                    ID     : 'DateInformationFacet',
                    Target : '@UI.FieldGroup#DateInformation'
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : 'Organization Details',
                    ID     : 'OrganizationDetailsFacet',
                    Target : '@UI.FieldGroup#OrganizationDetails'
                }
            ]
        },
        //this facet shows a table on the object page by referring to a lineItem annotation via association purchaseFlow
        {
            $Type         : 'UI.ReferenceFacet',
            Label         : 'Purchase Process Flow',
            ID            : 'ProcessFlowFacet',
            Target        : 'purchaseFlow/@UI.LineItem',
        }
    ]
});

annotate service.PurchaseFlow with @(UI : {
    LineItem : [
        {
            $Type : 'UI.DataField',
            Value : stepStatus,
            Criticality : criticality,
            Label : 'Status'
        },
        {
            $Type : 'UI.DataField',
            Value : processStep,
            Label : 'Process Step'
        },
        {
            $Type : 'UI.DataField',
            Value : stepStartDate,
            Label : 'Start Date'
        },
        {
            $Type : 'UI.DataField',
            Value : stepEndDate,
            Label : 'End Date'
        },
        {
            $Type : 'UI.DataField',
            Value : purchaseRequest.contactPerson.fullName,
            Label : 'Contact Person'
        }
    ]
});

// Communication.Contact annotation for contact person is defined in srv/common.cds
