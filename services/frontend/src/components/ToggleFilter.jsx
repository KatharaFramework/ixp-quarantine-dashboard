import React from 'react';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

const ToggleFilter = ({viewFailed, handleFilter}) => {
    return (
        <div className="d-flex justify-content-end align-items-center">
            <div className="fw-bold text-end me-3 text-primary" style={{fontSize: "1.4rem"}}>
                Filter Results:
            </div>
            <ToggleButtonGroup
                type="radio"
                name="options"
                defaultValue={1}
                value={viewFailed}  // Bind the state value
                onChange={handleFilter} // Handle selection change
                className="d-flex">
                <ToggleButton
                    variant="outline-primary"
                    size="sm"
                    id="all"
                    value={1}
                    className="px-3 py-2 rounded-pill border-primary">
                    All
                </ToggleButton>
                <ToggleButton
                    variant="outline-danger"
                    size="sm"
                    id="failed"
                    value={2}
                    className="ms-2 px-3 py-2 rounded-pill border-danger">
                    Failed
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
};

export default ToggleFilter;
