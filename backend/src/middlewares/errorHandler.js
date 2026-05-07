const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err.message);
    res.status(500).json({
        success: false,
        error: err.message || 'Erreur interne du serveur'
    });
};

module.exports = errorHandler;