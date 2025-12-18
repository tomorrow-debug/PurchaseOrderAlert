namespace scp.cloud;
using PurchaseRequestService as service from './incidentservice';

using {
    cuid
} from '@sap/cds/common';

annotate cuid with {
    ID @(
        title : '{i18n>ID}',
        UI.HiddenFilter,
        Core.Computed
    );
}

annotate service.PurchaseRequests with {
    ID @UI.Hidden: true;
    contactPerson @UI.Hidden : true;
    identifier @(Common.FieldControl: identifierFieldControl);
};

// Add criticality at entity level for row highlighting
annotate service.PurchaseRequests with @UI.Criticality : priority.criticality;

annotate service.PurchaseRequests with {
    requestStatus @Common : {
        Text            : requestStatus.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };
    orderUnit @Common : {
        Text            : orderUnit.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };
    currency @Common : {
        Text            : currency.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };  
    priority @Common : {
        Text            : priority.name,
        TextArrangement : #TextOnly,
        ValueListWithFixedValues
    };
    supplier @Common : {
        Text            : supplier.name,
        TextArrangement : #TextOnly
    };
};

annotate service.OrderUnit with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Order Unit'
};

annotate service.Currency with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Currency'
};

annotate service.Priority with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Priority'
         @UI.ValueCriticality : criticality;
};

annotate service.RequestStatus with {
    code @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Request Status'
};

annotate service.Supplier with {
    ID @Common : {
        Text            : name,
        TextArrangement : #TextOnly
    }    @title :  'Supplier'
};

annotate service.Individual with @(Communication.Contact : {
    fn   : fullName,
    kind   : #individual,
    email  : [{
        address : emailAddress,
        type    : #work
    }]
});