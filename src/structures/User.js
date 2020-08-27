const Collection = require('@discordjs/collection')

/**
 * Represents a User
 */
class User {
    /**
     * @param {InstaClient} client The instantiating client
     * @param {object} data The data for the user
     */
    constructor (client, data) {
        /**
         * @type {InstaClient}
         * The client that instantiated this
         */
        this.client = client
        /**
         * @type {Collection<string, User>}
         * Collection of users that follow this user.
         * <info>You have to use user.fetchFollowers() to fill the collection</info>
         */
        this.followers = new Collection()
        /**
         * @type {Collection<string, User>}
         * Collection of users this user follows.
         * <info>You have to use user.fetchFollowing() to fill the collection</info>
         */
        this.following = new Collection()

        this._patch(data)
    }

    /**
     * @type {Chat}
     * Private chat between the client and the user.
     */
    get privateChat () {
        return this.client.cache.chats.find((chat) => chat.users.size === 1 && chat.users.first().id === this.id)
    }

    _patch (data) {
        /**
         * @type {string}
         * The ID of the user
         */
        this.id = data.pk
        /**
         * @type {string}
         * The username of the user
         */
        this.username = data.username
        /**
         * @type {string}
         * The full name of the user
         */
        this.fullName = data.full_name
        /**
         * @type {string}
         * The biography of the user
         */
        this.biography = data.biography
        /**
         * @type {boolean}
         * Whether the user is private
         */
        this.isPrivate = data.is_private
        /**
         * @type {boolean}
         * Whether the user is verified
         */
        this.isVerified = data.is_verified
        /**
         * @type {boolean}
         * Whether the user is a business profile
         */
        this.isBusiness = data.is_business
        /**
         * @type {number}
         * The number of media published by the user
         */
        this.mediaCount = data.media_count
        /**
         * @type {string}
         * The URL of the user's avatar
         */
        this.avatarURL = data.profile_pic_url
        /**
         * @type {number}
         * The number of followers of the user
         */
        this.followerCount = data.follower_count
        /**
         * @type {number}
         * The number of followed users by the user
         */
        this.followingCount = data.following_count
        /**
         * @type {number}
         * The number of videos published by IGTV
         */
        this.totalIgtvVideos = data.total_igtv_videos
    }

    /**
     * Start following a user
     * @returns {Promise<void>}
     */
    async follow () {
        await this.client.ig.friendship.create(this.id)
    }

    /**
     * Stop following a user
     * @returns {Promise<void>}
     */
    async unfollow () {
        await this.client.ig.friendship.destroy(this.id)
    }

    /**
     * Block a user
     * @returns {Promise<void>}
     */
    async block () {
        await this.client.ig.friendship.block(this.id)
    }

    /**
     * Unblock a user
     * @returns {Promise<void>}
     */
    async unblock () {
        await this.client.ig.friendship.unblock(this.id)
    }

    /**
     * Approve follow request
     * @returns {Promise<void>}
     */
    async approveFollow () {
        await this.client.ig.friendship.approve(this.id)
    }

    /**
     * Reject follow request
     * @returns {Promise<void>}
     */
    async denyFollow () {
        await this.client.ig.friendship.deny(this.id)
    }

    /**
     * Remove the user from your followers
     * @returns {Promise<void>}
     */
    async removeFollower () {
        await this.client.ig.friendship.removeFollower(this.id)
    }

    /**
     * Fetch the users that follow this user
     * @returns {Promise<Collection<string, User>>}
     */
    async fetchFollowers () {
        const followersItems = await this.client.ig.feed.accountFollowers(this.id).items()
        followersItems.forEach((user) => {
            if (this.client.cache.users.has(user.pk)) {
                this.client.cache.users.get(user.pk)._patch(user)
            } else {
                const createdUser = new User(this.client, user)
                this.client.cache.users.set(user.pk, createdUser)
            }
            this.followers.set(user.pk, this.client.cache.users.get(user.pk))
        })
        return this.followers
    }

    /**
     * Fetch the users that follow this user
     * @returns {Promise<Collection<string, User>>}
     */
    async fetchFollowing () {
        const followingItem = await this.client.ig.feed.accountFollowing(this.id).items()
        followingItem.forEach((user) => {
            if (this.client.cache.users.has(user.pk)) {
                this.client.cache.users.get(user.pk)._patch(user)
            } else {
                const createdUser = new User(this.client, user)
                this.client.cache.users.set(user.pk, createdUser)
            }
            this.followers.set(user.pk, this.client.cache.users.get(user.pk))
        })
        return this.following
    }

    /**
     * Send a message to the user
     * @param {string} content The content of the message to send
     * @returns {Promise<Message>}
     */
    send (content) {
        return this.privateChat.send(content)
    }

    toString () {
        return this.id
    }
}

module.exports = User