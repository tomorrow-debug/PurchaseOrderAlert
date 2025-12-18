const cds = require("@sap/cds");

/**
 * Enumeration values for FieldControlType
 * @see https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#FieldControlType
 */
const FieldControl = {
    Mandatory: 7,
    Optional: 3,
    ReadOnly: 1,
    Inapplicable: 0,
  };
  
module.exports = cds.service.impl(async function (srv) {
    const {
        PurchaseRequests,
        Individual,
        Supplier
    } = srv.entities

    //read/edit event hook after read  of entity 'PurchaseRequests'
    srv.after(["READ", "EDIT"], "PurchaseRequests", setTechnicalFlags);
    srv.after("READ", "PurchaseRequests", setPriorityCriticality);
    srv.before("SAVE", "PurchaseRequests", validatePurchaseRequest);

    /**
     * Set technical flags, used for controlling UI behaviour, on the 'PurchaseRequests' entity
     *
     * @param PurchaseRequests { PurchaseRequests | PurchaseRequests[] } (Array of) PurchaseRequests
     */
    function setTechnicalFlags(PurchaseRequests) {

        function _setFlags(purchaseRequest) {
            purchaseRequest.isDraft = !purchaseRequest.IsActiveEntity;
            // field control on the 'identifier' property
            if (purchaseRequest.IsActiveEntity) {
                purchaseRequest.identifierFieldControl = FieldControl.Optional;
            } else if (purchaseRequest.HasActiveEntity) {
                purchaseRequest.identifierFieldControl = FieldControl.ReadOnly;
            } else {
                purchaseRequest.identifierFieldControl = FieldControl.Mandatory;
            }
        }

        if (Array.isArray(PurchaseRequests)) {
            PurchaseRequests.forEach(_setFlags);
        } else {
            _setFlags(PurchaseRequests);
        }
    };

    /**
     * Set priority criticality used for display in LR table
     *
     * @param PurchaseRequests { PurchaseRequests | PurchaseRequests[] } (Array of) PurchaseRequests
     */
    function setPriorityCriticality(PurchaseRequests) {

        function _setCriticality(purchaseRequest) {
            if (purchaseRequest.priority) {
                purchaseRequest.priority.criticality = parseInt(purchaseRequest.priority.code);
            }
        }

        if (Array.isArray(PurchaseRequests)) {
            PurchaseRequests.forEach(_setCriticality);
        } else {
            _setCriticality(PurchaseRequests);
        }
    }

    /**
     * Validate a 'purchaseRequest' entry
     *
     * @param req   Request
     */
    function validatePurchaseRequest(req) {
        // check mandatory properties
        if (!req.data.identifier) {
            req.error(400, "Enter a Purchase Request Identifier", "in/identifier");
        }
        if (!req.data.material) {
            req.error(400, "Enter a Material Number", "in/material");
        }
        if (!req.data.purchaseQuantity || req.data.purchaseQuantity <= 0) {
            req.error(400, "Enter a valid Purchase Quantity", "in/purchaseQuantity");
        }
    }
})
