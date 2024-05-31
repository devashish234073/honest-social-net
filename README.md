# honest-social-net

A social media world without password where fellow humans trust each others and each are honest to login with their own userid.

User id you should choose such a unique that no one in other part of world should be able to think otherwise you can login to theirs.

Video of initial implementation: https://www.youtube.com/watch?v=xUR8KqrOigw

This is the signIn vs signUp logic:

![image](https://github.com/devashish234073/honest-social-net/assets/20777854/3d5a11f1-2974-4fa0-ba37-0d68bc26a356)

User is initialized with several arrays like friends , friendRequests, notifications, etc.

The accept and reject friend request login is(For ACCEPT the friendId is removed from the friendRequest list and the friend list of each other is updated with each other's Id):

![image](https://github.com/devashish234073/honest-social-net/assets/20777854/33427fc8-816f-4116-ba75-2fc4c0896934)

UI as of 23rd May 2024:

![image](https://github.com/devashish234073/honest-social-net/assets/20777854/4416e1d7-314a-4ccf-bc12-296f87c386c1)

UI as of 30th May 2024:

Added like button counter and on hover shows who all liked:

![image](https://github.com/devashish234073/honest-social-net/assets/20777854/12c7b299-08d4-4ba3-9c78-256479d70c1e)

UI as of 31st May 2024:

![image](https://github.com/devashish234073/honest-social-net/assets/20777854/9feecb46-de54-49c5-b393-79eb9de64f26)



Also planning to implement the feature where after liking a picture post the picture content will change , i.e. interactive like feature.

