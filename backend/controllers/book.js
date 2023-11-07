const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.imageUrl}` // Utilise l'URL de l'image ici
  });
  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(403).json({ error }) });
};
  
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.imageUrl}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : 'Not authorized'});
          } else {
            if (req.file) {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(403).json({ error })); 
              })
            } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(403).json({ error })); 
            }
          }
      })
      .catch((error) => {
          res.status(403).json({ error });
      });
};
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(403).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};
  
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const bookId = req.params.id; 
  const userId = req.auth.userId;
  const rate = req.body;


  // Recherche le livre par son ID.
  Book.findOne({ _id: bookId })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé.' });
      }

      // Vérifie si l'utilisateur a déjà noté ce livre.
      const hasUserRated = book.ratings.some((rating) => rating.userId === userId);

      if (hasUserRated) {
        return res.status(403).json({ error: 'L\'utilisateur a déjà noté ce livre.' });
      }
      rate.grade = rate.rating;
      // Ajoute la notation à la liste des notations du livre.
      book.ratings.push(rate);
    
      const totalRatings = book.ratings.length;
      const sumOfGrades = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
      book.averageRating = sumOfGrades / totalRatings;

   

      // Enregistre le livre mis à jour dans la base de données.
      book.save()
        .then(book => res.status(200).json(book))
        .catch((saveErr) => {
          return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'enregistrement de la note.' });
        });
    })
    .catch((error) => {
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de la recherche du livre.' });
    });
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3) // Utilise la méthode `limit` pour limiter les résultats à 3 livres.
    .then((books) => {
      const bestRatedBooks = books.slice(0, 3);
      return res.status(200).json(bestRatedBooks);
    })
    .catch((err) => {
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de la recherche des livres les mieux notés.' });
    });
}