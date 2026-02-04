const { getDB } = require('../config/db');

class AdminUser {
  constructor() {
    this.collection = 'admin_users';
  }

  /**
   * Busca um admin por email
   */
  async findByEmail(email) {
    const db = getDB();
    return db.collection(this.collection).findOne({ email });
  }

  /**
   * Verifica se existe algum admin
   */
  async exists() {
    const db = getDB();
    const count = await db.collection(this.collection).countDocuments();
    return count > 0;
  }

  /**
   * Cria um novo admin
   */
  async create(adminData) {
    const db = getDB();
    const result = await db.collection(this.collection).insertOne({
      ...adminData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  }

  /**
   * Atualiza um admin
   */
  async update(email, updateData) {
    const db = getDB();
    return db.collection(this.collection).updateOne(
      { email },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
  }

  /**
   * Deleta um admin
   */
  async delete(email) {
    const db = getDB();
    return db.collection(this.collection).deleteOne({ email });
  }
}

module.exports = new AdminUser();
