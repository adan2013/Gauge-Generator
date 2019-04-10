﻿using System;
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
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for Layers_Page.xaml
    /// </summary>
    public partial class Layers_Page : Page
    {
        public Layers_Page()
        {
            InitializeComponent();
            Reload_Layers_List(-1);
        }

        private void Reload_Layers_List(int index)
        {
            layers_view.Items.Clear();
            foreach(Layer i in Global.project.layers)
            {
                ListBoxItem item = new ListBoxItem();
                StackPanel spnl = new StackPanel();
                Image img = new Image();
                Label lbl = new Label();
                spnl.Orientation = Orientation.Horizontal;
                img.Source = new BitmapImage(new Uri(Global.LayerSmallImages[(int)Global.GetLayerType(i)]));
                img.Margin = new Thickness(3);
                lbl.Content = i.Label;
                lbl.FontSize = 16;
                lbl.FontFamily = new FontFamily("Segoe UI");
                spnl.Children.Add(img);
                spnl.Children.Add(lbl);
                layers_view.Items.Add(spnl);
            }
            layers_view.SelectedIndex = index;
        }

        private void New_layer_btn(object sender, RoutedEventArgs e)
        {
            if(Global.project.layers.Count < Global.MAX_LAYERS)
            {
                NewItemWindow w = new NewItemWindow();
                w.Owner = Application.Current.MainWindow;
                w.ShowDialog();
                w.Close();
                Reload_Layers_List(0);
            }
            else
            {
                MessageBox.Show("You have reached the maximum number of layers in this project!", "Maximum number of layers", MessageBoxButton.OK, MessageBoxImage.Information, MessageBoxResult.OK);
            }
        }

        private void Delete_layer_btn(object sender, RoutedEventArgs e)
        {
            if(layers_view.SelectedIndex >= 0 && MessageBox.Show("Do want to delete this object? Are you sure?", "Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning, MessageBoxResult.No) == MessageBoxResult.Yes)
            {
                Global.project.layers.RemoveAt(layers_view.SelectedIndex);
                Reload_Layers_List(-1);
            }
        }

        private void Edit_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex >= 0)
            {
                Global.EditingLayer = Global.project.layers[layers_view.SelectedIndex];
                Global.SetSidebar(Global.SidebarPages.Editor);
            }
        }

        private void Moveup_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex > 0)
            {
                int i = layers_view.SelectedIndex;
                Layer temp = Global.project.layers[i];
                Global.project.layers.RemoveAt(i);
                Global.project.layers.Insert(i - 1, temp);
                Reload_Layers_List(i - 1);
            }
        }

        private void Movedn_layer_btn(object sender, RoutedEventArgs e)
        {
            if (layers_view.SelectedIndex >= 0 && layers_view.SelectedIndex < layers_view.Items.Count - 1)
            {
                int i = layers_view.SelectedIndex;
                Layer temp = Global.project.layers[i];
                Global.project.layers.RemoveAt(i);
                Global.project.layers.Insert(i + 1, temp);
                Reload_Layers_List(i + 1);
            }
        }

        private void Layers_view_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            bool r = !(layers_view.SelectedIndex < 0);
            del_btn.IsEnabled = r;
            edit_btn.IsEnabled = r;
            up_btn.IsEnabled = r;
            dn_btn.IsEnabled = r;
        }

        private void Layers_view_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            Edit_layer_btn(edit_btn, new RoutedEventArgs());
        }
    }
}
