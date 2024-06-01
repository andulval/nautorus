class APIFeatures {
  constructor(query, queryString) {
    //query from mongoose
    //queryString from express
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['limit', 'page', 'sort', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);
    //or just destructuring:
    // const { page, sort, limit, fields, ...queryObj } = req.query;

    //1b advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // \b - exac word (nie słowa zawierajce np. lte -> lt)
    //( | | | ) -> | oznacza 'lub'
    // /g - muliple times
    const objToSearch = JSON.parse(queryStr);

    this.query = this.query.find(objToSearch);

    return this; // return query object with changed some data

    //?WHY? execution is after query changing like filter adn pagenation? -> thenable object is the simplest thing in the world:
    // Any object that has a method named “then” is called a “thenable” object.
    //a mongoose uzywa wlasnie thenable a nie Promises
    //wiec tutaj - do kiedy nie wywołamy funkcji then na obiekcie Query monggose
    //co dzieje sie przy 'await' to nie jest wyzwalana funckja asynchroniczna
    //tylko obiekt Query z  odpowiednimi parametrami
  }

  sort() {
    if (this.queryString.sort) {
      //monggose sort - eg: sort=price
      //   console.log('sort', req.query.sort);
      //   console.log('sort ,', req.query.sort.split(','));
      //   console.log('sort ,', req.query.sort.split(',').join(' '));
      const sortBy = this.queryString.sort.split(',').join(' '); //make query required from mongoose
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //3 - field limiting (select fields)
    if (this.queryString.fields) {
      //monggose fields - eg: fields=price -> shows only price parameter for tours
      //   console.log('fields', req.query.fields);
      //   console.log('fields ,', req.query.fields.split(','));
      //   console.log('fields ,', req.query.fields.split(',').join(' '));
      const limitBy = this.queryString.fields.split(',').join(' '); //make query required from mongoose
      this.query = this.query.select(limitBy);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //convert to Number or when undefined select 1
    const limit = this.queryString.limit * 1 || 10; //convert to Number or when undefined select 1
    const skip = (page - 1) * limit; //limit * page - limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
