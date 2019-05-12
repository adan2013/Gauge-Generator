using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for NewItemWindow.xaml
    /// </summary>
    public partial class NewItemWindow : Window
    {

        const string ERR_NAME = "Layer must have a name!";
        const string ERR_SOURCE = "This layer must have a range source!";

        Global.LayersType itemSelected = Global.LayersType.Range;
        List<Layer> RefList = new List<Layer>();

        public NewItemWindow()
        {
            InitializeComponent();
            LoadItemsList();
            LoadRangeList();
            LoadDescription((int)itemSelected);
            RangePanel.Visibility = Visibility.Hidden;
            lbl_err_name.Content = "";
            lbl_err_source.Content = "";
            txt_name.Text = "New Layer";
            txt_name.Focus();
            txt_name.SelectionStart = 0;
            txt_name.SelectionLength = txt_name.Text.Length;
        }

        private void LoadItemsList()
        {
            for(int i=0; i<5; i++)
            {
                Image img = new Image
                {
                    Source = new BitmapImage(new Uri(Global.LayerBigImages[i])),
                    Width = 90,
                    Height = 90
                };
                Border br = new Border
                {
                    Name = "item" + i,
                    Child = img,
                    BorderBrush = (i==0 ? Brushes.Black : Brushes.Transparent),
                    BorderThickness = new Thickness(5),
                    Margin = new Thickness(2),
                    ToolTip = Global.LayerNames[i]
                };
                br.MouseEnter += Br_MouseEnter;
                br.MouseLeave += Br_MouseLeave;
                br.MouseDown += Br_MouseDown;
                items_view.Children.Add(br);
            }
        }

        private void LoadDescription(int index)
        {
            lbl_title.Text = Global.LayerNames[index];
            lbl_description.Text = Global.LayerDescriptions[index];
        }

        private void Br_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                foreach(object i in items_view.Children) if (i is Border o) o.BorderBrush = Brushes.Transparent;
                Border br = (Border)sender;
                itemSelected = (Global.LayersType)int.Parse(br.Name.Substring(4));
                br.BorderBrush = Brushes.Black;
                LoadDescription(int.Parse(br.Name.Substring(4)));
                ValidateOperation();
                RangePanel.Visibility = (itemSelected == Global.LayersType.Range ? Visibility.Hidden : Visibility.Visible);
                if (e.ClickCount == 2 && ok_btn.IsEnabled) Ok_btn_Click(ok_btn, new RoutedEventArgs());
            }
        }

        private void Br_MouseLeave(object sender, MouseEventArgs e)
        {
            Border br = (Border)sender;
            if(br.BorderBrush == Brushes.DarkGray) br.BorderBrush = Brushes.Transparent;
        }

        private void Br_MouseEnter(object sender, MouseEventArgs e)
        {
            Border br = (Border)sender;
            if (itemSelected != (Global.LayersType)int.Parse(br.Name.Substring(4))) br.BorderBrush = Brushes.DarkGray;
        }

        private void LoadRangeList()
        {
            RangeItemsList.Items.Clear();
            RefList.Clear();
            foreach(Layer i in Global.project.layers)
            {
                if (i is Range_Item)
                {
                    RefList.Add(i);
                    RangeItemsList.Items.Add(i.Label);
                }
            }
            if (RangeItemsList.Items.Count > 0) RangeItemsList.SelectedIndex = 0;
        }

        private void Cancel_btn(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }

        private void Ok_btn_Click(object sender, RoutedEventArgs e)
        {
            Layer newItem = (Layer)Activator.CreateInstance(Global.GetLayerObject(itemSelected));
            newItem.Label = txt_name.Text;
            if (itemSelected != Global.LayersType.Range) newItem.SetRangeSource((Range_Item)RefList[RangeItemsList.SelectedIndex]);
            Global.project.layers.Insert(0, newItem);
            DialogResult = true;
        }

        private void ValidateOperation()
        {
            bool approved = true;
            lbl_err_name.Content = "";
            lbl_err_source.Content = "";
            if (txt_name.Text.Length == 0)
            {
                lbl_err_name.Content = ERR_NAME;
                approved = false;
            }
            if (itemSelected != Global.LayersType.Range && RangeItemsList.SelectedIndex < 0)
            {
                lbl_err_source.Content = ERR_SOURCE;
                approved = false;
            }
            ok_btn.IsEnabled = approved;
        }

        private void RangeItemsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ValidateOperation();
        }

        private void Txt_name_TextChanged(object sender, TextChangedEventArgs e)
        {
            ValidateOperation();
        }

        private void Txt_name_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter && ok_btn.IsEnabled) Ok_btn_Click(ok_btn, new RoutedEventArgs());
        }
    }
}
