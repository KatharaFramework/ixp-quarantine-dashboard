import React from 'react';
import ResultCard from './ResultCard';

const ResultsView = ({ viewFailed, results }) => {
    return (
        <>
            {viewFailed === 1 && results.map((result, index) => (
                <ResultCard key={index} result={result} />
            ))}
            {viewFailed === 2 && results.map((result, index) => (
                !result.success && <ResultCard key={index} result={result} />
            ))}
        </>
    );
};

export default ResultsView;
