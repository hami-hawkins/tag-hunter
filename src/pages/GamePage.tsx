import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRandomArtwork } from '../apis/artworks'
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState } from 'react'
import { LatLng } from 'models/models'
import * as game from '../game'
import SprayCan from '@/icons/SprayCan'
import { IsAuthenticated } from '@/components/IsAuthenticated'
import { NotAuthenticated } from '@/components/NotAuthenticated'

export default function GamePage() {
  const wellington = { lat: -41.29244, lng: 174.77876 }
  const welcome =
    'Use the mouse to drag the pin around the map then hit submit to see if you have found it!'

  const [showMarker, setShowMarker] = useState(true)
  const [guessCount, setGuessCount] = useState(5)
  const [userLocation, setUserLocation] = useState<LatLng | null>(wellington)
  const [gameMessage, setGameMessage] = useState<string>(welcome)
  const [hasFound, setHasFound] = useState(false)
  // const [gameOver, setGameOver] = useState(false)

  const queryClient = useQueryClient()
  const streetViewRef = useRef<HTMLDivElement | null>(null)

  const {
    data: artwork,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['artwork'],
    queryFn: () => getRandomArtwork(),
  })

  useEffect(() => {
    if (streetViewRef.current && userLocation) {
      const panorama = new google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: userLocation,
          pov: {
            heading: 34,
            pitch: 10,
          },
          zoomControl: false,
          addressControl: false,
          fullscreenControl: false,
          linksControl: false,
          panControl: false,
          enableCloseButton: false,
        },
      )

      panorama.setPosition(userLocation)
    }
  }, [userLocation])

  if (isPending) {
    return <>Loading</>
  }

  if (isError) {
    return <>Error</>
  }

  return (
    <>
      <div id="debug-console">
        <p>Game status: {hasFound ? 'Found' : 'Not found'}</p>
        <p>Guess count: {guessCount}</p>
      </div>
      <div
        id="container"
        className="m-10 flex flex-wrap justify-center bg-blue-400"
      >
        <div
          id="game-display"
          className="flex w-1/2 min-w-[540px] flex-col items-center bg-green-500"
        >
          <div
            id="art-container"
            className=" flex h-[500px] w-full flex-col items-center bg-orange-500 p-10"
          >
            <img
              className="h-full w-full max-w-[540px] rounded-md object-cover shadow-md"
              src={`images/${artwork.imageUrl}`}
              alt=""
            />
          </div>

          <IsAuthenticated>
            <div className="flex h-[350px] w-full max-w-[540px] flex-col items-center bg-yellow-400 px-10 pb-10">
              <div
                id="streetview"
                ref={streetViewRef}
                className="h-full w-full rounded-full"
              />
            </div>
          </IsAuthenticated>
          <NotAuthenticated>
            <div className="p-10">
              Log in or Sign up to unlock the Streetview portal!
            </div>
          </NotAuthenticated>
        </div>

        <div
          id="game-interface"
          className="flex w-1/2 min-w-[540px] flex-col items-center"
        >
          <div id="game-message" className="">
            {guessCount > 0 && <p>{gameMessage}</p>}

            {guessCount < 1 && (
              <div>Not this time... Get out on the street and get hunting!</div>
            )}
          </div>
          {hasFound ||
            (guessCount < 1 && (
              <div className="p-10">
                <button onClick={playAgain}>Play again!</button>
              </div>
            ))}
          {guessCount > 0 && !hasFound && (
            <div id="submission" className="flex w-full max-w-[600px] px-10">
              <button
                onClick={handleSubmitGuess}
                className="m-5 rounded-md bg-gradient-to-br from-thGold to-thUmber p-4 px-10 font-bold text-white shadow-md ring-thGray/50 hover:ring-2"
              >
                Submit
              </button>
              <div
                id="mistakes-container"
                className="flex w-2/3 justify-between p-10"
              >
                <>
                  <div className={guessCount > 0 ? '' : 'invisible'}>
                    <SprayCan />
                  </div>
                  <div className={guessCount > 1 ? '' : 'invisible'}>
                    <SprayCan />
                  </div>
                  <div className={guessCount > 2 ? '' : 'invisible'}>
                    <SprayCan />
                  </div>
                  <div className={guessCount > 3 ? '' : 'invisible'}>
                    <SprayCan />
                  </div>
                  <div className={guessCount > 4 ? '' : 'invisible'}>
                    <SprayCan />
                  </div>
                </>
              </div>
            </div>
          )}
          <div
            id="map-container"
            className="flex w-full flex-col items-center bg-red-700 p-10"
          >
            <div
              id="map"
              className="h-[50vh] w-full border-2 border-thGray drop-shadow-lg"
            >
              <APIProvider apiKey={'AIzaSyAniaK3l1jH7gSgpiNd-PyBMB0ygsy8QXA'}>
                <Map
                  defaultCenter={wellington}
                  defaultZoom={13}
                  mapId="gameMap"
                  minZoom={14}
                  fullscreenControl={null}
                >
                  <AdvancedMarker
                    position={userLocation}
                    draggable={true}
                    onDrag={handleDragEnd}
                  />

                  {showMarker && (
                    <AdvancedMarker
                      position={{
                        lat: artwork.latitude,
                        lng: artwork.longitude,
                      }}
                    >
                      <Pin background={'gold'} borderColor={'black'} />
                    </AdvancedMarker>
                  )}
                </Map>
              </APIProvider>
            </div>
            <div id="coordinates" className="flex flex-col items-center">
              <div className="flex gap-5 p-2">
                <div>{`Latitude: ${userLocation?.lat.toFixed(6)}`}</div>
                <div>{`Longitude: ${userLocation?.lng.toFixed(6)}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  function handleDragEnd(e: google.maps.MapMouseEvent) {
    if (e.latLng) {
      const location: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setUserLocation(location)
    }
  }

  function handleSubmitGuess() {
    // Calculate distance to artwork
    if (userLocation && artwork) {
      const dist = game.calculateDistance(
        { lat: artwork.latitude, lng: artwork.longitude },
        userLocation,
      )

      if (game.hasFoundArt(dist)) {
        setHasFound(true)
        setShowMarker(true)
        setGameMessage(`You found it! (${dist.toFixed(1)}m away)`)
        return
      }

      setGameMessage(game.failureMessage(dist))
      setGuessCount(guessCount - 1)
    }
  }

  function playAgain() {
    if (hasFound || guessCount < 1) {
      queryClient.invalidateQueries()
      setShowMarker(false)
      setGuessCount(5)
      setUserLocation(wellington)
      setGameMessage(welcome)
      setHasFound(false)
    }
  }
}
