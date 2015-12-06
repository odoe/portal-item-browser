module PortalItems where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import String

-- Model

type alias PortalItem =
  { id : String
  , title : String
  , thumbnailUrl : String
  , description : String
  , accessInformation : String
  , itemUrl : String
  , owner : String
  , snippet : String
  , avgRating : Float
  , selected : Bool
  , showmap : Bool
  }

type alias Model =
  { items: List PortalItem
  }

initialModel : Model
initialModel =
  { items = []
  }

-- UPDATE

type Action = NoOp
            | UpdateModel Model
            | Selected String Bool
            | ShowMap String Bool

update : Action -> Model -> Model
update action model =
  case action of
    NoOp ->
      model
    UpdateModel m ->
      m
    Selected id isSelected ->
      let updateItem m = if m.id == id then { m | selected = isSelected } else m
      in
        { model | items = List.map updateItem model.items }
    ShowMap id showMap ->
      let updateItem m = if m.id == id then { m | showmap = showMap } else m
      in
        { model | items = List.map updateItem model.items }

backgroundImage url =
  style
    [ ("backgroundImage", "url(" ++ url ++ ")")
    ]

itemList : Signal.Address Action -> PortalItem -> Html
itemList address model=
  div
    [
      backgroundImage model.thumbnailUrl,
      onClick address (Selected model.id True),
      class "element item-card"
    ]
    [ label
        [ class "item-title" ]
        [ text model.title ]
    ]

itemShowMap : Signal.Address Action -> PortalItem -> Html
itemShowMap address model =
  div
    [ class "item-detail" ]
    [
      div
        [
          class "item-info"
        ]
        [
          span
            [ class "item-title" ]
            [
              button
                [
                  onClick address (ShowMap model.id False),
                  class "back-button hover-shadow"
                ]
                [ ],
              text model.title
            ],
          div
            [
              class "view-div"
            ]
            []
        ]
    ]

itemDetail : Signal.Address Action -> PortalItem -> Html
itemDetail address model =
  div
    [ class "item-detail" ]
    [
      div
        [
          class "item-info"
        ]
        [
          span
            [ class "item-title" ]
            [
              button
                [
                  onClick address (Selected model.id False),
                  class "back-button hover-shadow"
                ]
                [ ],
              text model.title
            ]
        , div
            [
              backgroundImage model.thumbnailUrl,
              onClick address (ShowMap model.id True),
              class "item-info-card"
            ]
            [
              label
                [ class "item-owner" ]
                [ text model.owner ]
            ]
        , div
            [
              class "item-snippet"
            ]
            [ text model.snippet ]
        , div
            [
              class "item-access-info"
            ]
            [ text model.accessInformation ]
        ]
    ]

listItems address model =
  let selected = List.filter (\x -> x.selected == True) model.items
      showmap = List.filter (\x -> x.showmap == True) model.items
      len = List.length selected
      len' = List.length showmap
      elems = if len == 0 then (List.map (itemList address) model.items)
              else if len' > 0 then List.map (itemShowMap address) selected
              else List.map (itemDetail address) selected
  in
    div
      [ classList [("block", len == 0), ("item-selected", len > 0)] ]
      elems


view : Signal.Address Action -> Model -> Html
view address model =
  div
    []
    [
      div
        [ class "header" ]
        [ text "ArcGIS Online Vector Tiles" ],
      listItems address model
    ]

-- PORTS

port portalItems : Signal Model

port modelChanges : Signal { items: List PortalItem }
port modelChanges =
  model

-- SIGNALS
inbox : Signal.Mailbox Action
inbox =
  Signal.mailbox NoOp

actions : Signal Action
actions =
  Signal.merge inbox.signal (Signal.map UpdateModel portalItems)

model : Signal Model
model =
  Signal.foldp update initialModel actions

main : Signal Html
main =
  Signal.map (view inbox.address) model