import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart, deleteUserFailure, deleteUserSuccess,
  signOutUserStart, signOutUserFailure, signOutUserSuccess
} from '../redux/user/UserSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
    password: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
        password: ''
      });
    }
  }, [currentUser]);

  const handleFileUpload = (file) => {
    if (!file) return;

    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prevData) => ({ ...prevData, avatar: downloadURL }));
        }).catch((error) => {
          setFileUploadError(true);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return; // Prevent further actions if currentUser is null
    try {
      dispatch(updateUserStart());
      const token = currentUser.token; // Assuming you have the token stored in currentUser
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return; // Prevent further actions if currentUser is null
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate('/signin'); // Redirect to the sign-in page after account deletion
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate('/signin');
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  }

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listing/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  }

  const handleListingDelete=async(listingId)=>{
      try{
        const res = await fetch(`/api/listing/delete/${listingId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success === false) {
          console.log(error.message);
          return;
        }
        setUserListings((prev)=>prev.filter((listing)=>listing._id!==listingId));
      }catch(error){
        console.log(error.message);
      }
  }

  if (!currentUser) {
    return (
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <p className='text-center'>User not found. Please sign in.</p>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || 'default-avatar-url'} // Replace 'default-avatar-url' with your default avatar URL
          alt="profile"
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>Error Image Upload (Image size must be less than 2MB)</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : ""}
        </p>
        <input type='text' id='username' value={formData.username} className='border p-3 rounded-lg' onChange={handleChange} />
        <input type='text' id='email' value={formData.email} className='border p-3 rounded-lg' onChange={handleChange} />
        <input type='password' id='password' placeholder='password' className='border p-3 rounded-lg' onChange={handleChange} />
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : "Update"}
        </button>
        <Link to="/create-listing" className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95 '>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={handleDeleteUser}>Delete account</span>
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ""}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? "User is updated successfully" : ""}</p>
      <button onClick={handleShowListings} className='p-3 w-full text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80' >Show Listings</button>
      <p className='text-red-700 mt-5'>{showListingsError ? 'Error showing listings' : ''}</p>
      {userListings && userListings.length > 0 &&
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listings/${listing._id}`}>
                {listing.imageUrls && listing.imageUrls.length > 0 ? (
                  <img src={listing.imageUrls[0]} alt='listing cover' className='h-16 w-16 object-contain' />
                ) : (
                  <div className='h-16 w-16 flex items-center justify-center bg-gray-200 text-gray-500'>
                    No Image
                  </div>
                )}
              </Link>
              <Link className='text-slate-700 font-semibold hover:underlined truncate' to={`/listings/${listing._id}`}>
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col items-center'>
                <button onClick={()=>handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
